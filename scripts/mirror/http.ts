export const MIRROR_USER_AGENT = "orca-docs-ko-mirror/1.0";

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500] as const;
const MEBIBYTE = 1024 * 1024;
const MAX_BODY_BYTES = 10 * 1024 * 1024;

type Sleep = (milliseconds: number) => Promise<void>;

export type ByteResponse = {
  body: Uint8Array;
  contentType: string | null;
};

const sleep: Sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const isRetryable = (status: number) =>
  status === 408 || status === 429 || (status >= 500 && status <= 599);

const responseError = (response: Response, url: URL) =>
  new Error(`HTTP ${response.status} for ${url.href}`);

const bodyCeilingLabel = (maxBytes: number) =>
  maxBytes % MEBIBYTE === 0
    ? `${maxBytes / MEBIBYTE} MiB`
    : `${maxBytes} bytes`;

const discard = async (response: Response) => {
  try {
    await response.body?.cancel();
  } catch {
    // The response is already unusable, so a cancellation error is immaterial.
  }
};

export class HttpClient {
  constructor(
    private readonly fetchImpl: typeof fetch = globalThis.fetch,
    private readonly wait: Sleep = sleep,
  ) {}

  async text(url: URL): Promise<string> {
    const response = await this.request(url);
    return new TextDecoder().decode(await this.readBody(response));
  }

  async bytes(
    url: URL,
    maxBytes = MAX_BODY_BYTES,
  ): Promise<ByteResponse> {
    if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
      throw new RangeError("HTTP byte ceiling must be a positive safe integer");
    }

    const response = await this.request(url);
    return {
      body: await this.readBody(response, maxBytes),
      contentType: response.headers.get("content-type"),
    };
  }

  private async request(url: URL): Promise<Response> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const response = await this.fetchImpl(url, {
        headers: { "user-agent": MIRROR_USER_AGENT },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) return response;

      if (isRetryable(response.status) && attempt < MAX_ATTEMPTS - 1) {
        await discard(response);
        await this.wait(RETRY_DELAYS_MS[attempt]!);
        continue;
      }

      await discard(response);
      throw responseError(response, url);
    }

    throw new Error("HTTP retry loop exhausted unexpectedly");
  }

  private async readBody(
    response: Response,
    maxBytes = MAX_BODY_BYTES,
  ): Promise<Uint8Array> {
    const declaredLength = response.headers.get("content-length");
    if (
      declaredLength !== null &&
      /^\d+$/.test(declaredLength) &&
      Number(declaredLength) > maxBytes
    ) {
      await discard(response);
      throw new Error(
        `HTTP response exceeds the ${bodyCeilingLabel(maxBytes)} body ceiling`,
      );
    }

    if (response.body === null) return new Uint8Array();

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new Error(
          `HTTP response exceeds the ${bodyCeilingLabel(maxBytes)} body ceiling`,
        );
      }
      chunks.push(value);
    }

    const body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return body;
  }
}
