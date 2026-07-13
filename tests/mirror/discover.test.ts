import { readFile } from "node:fs/promises";

import { afterEach, describe, expect, test, vi } from "vitest";

import {
  canMirrorAsset,
  discoverDocs,
} from "../../scripts/mirror/discover.js";
import { HttpClient } from "../../scripts/mirror/http.js";

const MAX_BODY_BYTES = 10 * 1024 * 1024;

const fixture = (name: string) =>
  readFile(new URL(`../fixtures/${name}`, import.meta.url), "utf8");

const asFetch = (implementation: (url: URL, init: RequestInit) => Promise<Response>) =>
  ((input: string | URL | Request, init?: RequestInit) =>
    implementation(new URL(input instanceof Request ? input.url : input), init ?? {})) as typeof fetch;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("documentation discovery", () => {
  test("keeps normalized canonical docs URLs in deterministic order", async () => {
    const [sitemap, robotsText] = await Promise.all([
      fixture("sitemap.xml"),
      fixture("robots.txt"),
    ]);
    const requestedPaths: string[] = [];
    const client = {
      text: async (url: URL) => {
        requestedPaths.push(url.pathname);
        return url.pathname === "/robots.txt" ? robotsText : sitemap;
      },
    };

    const result = await discoverDocs(client);

    expect(requestedPaths).toEqual(["/robots.txt", "/sitemap.xml"]);
    expect(result.robotsText).toBe(robotsText);
    expect(
      result.pages.map(({ url, lastmod }) => ({ href: url.href, lastmod })),
    ).toEqual([
      {
        href: "https://www.onorca.dev/docs",
        lastmod: "2026-07-13",
      },
      {
        href: "https://www.onorca.dev/docs/agents",
        lastmod: null,
      },
      {
        href: "https://www.onorca.dev/docs/install",
        lastmod: "2026-07-12",
      },
    ]);
  });

  test("uses the supplied canonical origin for discovery requests", async () => {
    const requested: string[] = [];
    const client = {
      text: async (url: URL) => {
        requested.push(url.href);
        return url.pathname === "/robots.txt"
          ? "User-agent: *\nAllow: /"
          : "<?xml version=\"1.0\"?><urlset />";
      },
    };

    await discoverDocs(client, new URL("https://www.onorca.dev/base"));

    expect(requested).toEqual([
      "https://www.onorca.dev/robots.txt",
      "https://www.onorca.dev/sitemap.xml",
    ]);
  });
});

describe("robots policy", () => {
  test("does not mirror assets explicitly denied to the mirror user-agent", async () => {
    const robotsText = await fixture("robots.txt");

    expect(
      canMirrorAsset(
        robotsText,
        new URL("https://www.onorca.dev/docs/demo.gif"),
      ),
    ).toBe(false);
  });

  test("mirrors assets without an explicit denial", () => {
    expect(
      canMirrorAsset(
        "User-agent: other-crawler\nDisallow: /",
        new URL("https://www.onorca.dev/docs/diagram.png"),
      ),
    ).toBe(true);
  });
});

describe("bounded HTTP client", () => {
  test("sends the mirror user-agent and exposes text and bytes", async () => {
    const signals: AbortSignal[] = [];
    const userAgents: string[] = [];
    const timeoutSignal = new AbortController().signal;
    const timeout = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(timeoutSignal);
    const fetchImpl = asFetch(async (_url, init) => {
      signals.push(init.signal as AbortSignal);
      userAgents.push(new Headers(init.headers).get("user-agent") ?? "");
      return new Response("hello", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    });
    const client = new HttpClient(fetchImpl);

    await expect(client.text(new URL("https://www.onorca.dev/docs"))).resolves.toBe(
      "hello",
    );
    await expect(
      client.bytes(new URL("https://www.onorca.dev/docs/hello.txt")),
    ).resolves.toEqual({
      body: new TextEncoder().encode("hello"),
      contentType: "text/plain; charset=utf-8",
    });
    expect(timeout).toHaveBeenCalledTimes(2);
    expect(timeout).toHaveBeenNthCalledWith(1, 20_000);
    expect(timeout).toHaveBeenNthCalledWith(2, 20_000);
    expect(signals).toEqual([timeoutSignal, timeoutSignal]);
    expect(userAgents).toEqual([
      "orca-docs-ko-mirror/1.0",
      "orca-docs-ko-mirror/1.0",
    ]);
  });

  test.each([408, 429, 500, 503])(
    "retries status %s at most three times with bounded waits",
    async (status) => {
      const waits: number[] = [];
      let attempts = 0;
      const client = new HttpClient(
        asFetch(async () => {
          attempts += 1;
          return new Response("retry", { status });
        }),
        async (milliseconds) => {
          waits.push(milliseconds);
        },
      );

      await expect(
        client.text(new URL("https://www.onorca.dev/sitemap.xml")),
      ).rejects.toThrow(`HTTP ${status}`);
      expect(attempts).toBe(3);
      expect(waits).toEqual([500, 1500]);
    },
  );

  test("returns the successful retry response", async () => {
    const waits: number[] = [];
    let attempts = 0;
    const client = new HttpClient(
      asFetch(async () => {
        attempts += 1;
        return attempts < 3
          ? new Response("busy", { status: 429 })
          : new Response("ready");
      }),
      async (milliseconds) => {
        waits.push(milliseconds);
      },
    );

    await expect(
      client.text(new URL("https://www.onorca.dev/docs")),
    ).resolves.toBe("ready");
    expect(waits).toEqual([500, 1500]);
  });

  test("fails immediately for a non-retryable non-2xx status", async () => {
    let attempts = 0;
    const client = new HttpClient(
      asFetch(async () => {
        attempts += 1;
        return new Response("missing", { status: 404 });
      }),
    );

    await expect(
      client.text(new URL("https://www.onorca.dev/missing")),
    ).rejects.toThrow("HTTP 404");
    expect(attempts).toBe(1);
  });

  test("rejects a response declared above the 10 MiB ceiling", async () => {
    const client = new HttpClient(
      asFetch(async () =>
        new Response("not read", {
          headers: { "content-length": String(MAX_BODY_BYTES + 1) },
        }),
      ),
    );

    await expect(
      client.bytes(new URL("https://www.onorca.dev/docs/large.bin")),
    ).rejects.toThrow("10 MiB");
  });

  test("rejects a streamed response that crosses the 10 MiB ceiling", async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(MAX_BODY_BYTES));
        controller.enqueue(new Uint8Array([0]));
        controller.close();
      },
    });
    const client = new HttpClient(
      asFetch(async () => new Response(body)),
    );

    await expect(
      client.bytes(new URL("https://www.onorca.dev/docs/stream.bin")),
    ).rejects.toThrow("10 MiB");
  });
});
