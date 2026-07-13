const PROTECTED_TOKEN_PATTERN = /\bORCA_PROTECTED_[A-Za-z0-9_]+\b/g;
const VALID_PROTECTED_TOKEN_PATTERN = /^ORCA_PROTECTED_\d{4,}$/;
const INTERNAL_TOKEN_PATTERN = /\u0000ORCA_INTERNAL_(\d{6,})\u0000/g;

export type ProtectedMarkdown = {
  markdown: string;
  map: Record<string, string>;
};

type ProtectionCandidate = {
  start: number;
  end: number;
  priority: number;
};

const protectFencedCode = (
  markdown: string,
  protect: (value: string) => string,
) => {
  const openingPattern = /^( {0,3})(`{3,}|~{3,})([^\r\n]*)(\r?\n)/gm;
  const closingPattern = /^( {0,3})(`{3,}|~{3,})([ \t]*)(?=\r?$)/gm;
  let result = "";
  let cursor = 0;
  let opening: RegExpExecArray | null;

  while ((opening = openingPattern.exec(markdown)) !== null) {
    if (opening.index < cursor) continue;
    const openingFence = opening[2]!;
    const info = opening[3]!;
    if (openingFence.startsWith("`") && info.includes("`")) continue;

    const bodyStart = openingPattern.lastIndex;
    closingPattern.lastIndex = bodyStart;
    let closing: RegExpExecArray | null;
    let acceptedClosing: RegExpExecArray | null = null;
    while ((closing = closingPattern.exec(markdown)) !== null) {
      const closingFence = closing[2]!;
      if (
        closingFence[0] === openingFence[0] &&
        closingFence.length >= openingFence.length
      ) {
        acceptedClosing = closing;
        break;
      }
    }
    if (acceptedClosing === null) continue;

    const rawBody = markdown.slice(bodyStart, acceptedClosing.index);
    const separator = rawBody.match(/\r?\n$/)?.[0] ?? "";
    const body =
      separator.length === 0 ? rawBody : rawBody.slice(0, -separator.length);
    result += markdown.slice(cursor, bodyStart);
    result += body.length === 0 ? body : protect(body);
    result += separator;
    result += acceptedClosing[0];
    cursor = acceptedClosing.index + acceptedClosing[0].length;
    openingPattern.lastIndex = cursor;
  }

  return `${result}${markdown.slice(cursor)}`;
};

const trimCandidateEnd = (value: string) => {
  let end = value.length;
  while (end > 0 && /[.,;:!?]/.test(value[end - 1]!)) end -= 1;
  for (const [opening, closing] of [
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
  ] as const) {
    while (
      end > 0 &&
      value[end - 1] === closing &&
      value.slice(0, end).split(closing).length >
        value.slice(0, end).split(opening).length
    ) {
      end -= 1;
    }
  }
  return end;
};

const protectSemanticLiterals = (
  markdown: string,
  protect: (value: string) => string,
) => {
  const internalRanges = [...markdown.matchAll(INTERNAL_TOKEN_PATTERN)].map(
    (match) => ({
      start: match.index,
      end: match.index + match[0].length,
    }),
  );
  INTERNAL_TOKEN_PATTERN.lastIndex = 0;
  const patterns: Array<{ pattern: RegExp; trim: boolean }> = [
    { pattern: /\borca[ \t]+[a-z][a-z0-9-]*\b/g, trim: false },
    {
      pattern:
        /\b(?:GitHub Copilot|Claude Code|Cursor CLI|OpenCode|Codex|ORCA|Orca)\b/g,
      trim: false,
    },
    {
      pattern:
        /--[A-Za-z0-9][A-Za-z0-9-]*(?:=(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;!?]+))?/g,
      trim: true,
    },
    {
      pattern:
        /(?:[A-Za-z]:\\|\\\\)(?:[^\s\\/:*?"<>|,;!?]+\\)+[^\s\\/:*?"<>|,;!?]+/g,
      trim: true,
    },
    {
      pattern: /(?:~[\\/]|\.{1,2}[\\/]|\/)[^\s<>`"',;!?]+/g,
      trim: true,
    },
    {
      pattern: /\b(?:[A-Za-z0-9._-]+[\\/])+(?:[A-Za-z0-9._-]+)\b/g,
      trim: true,
    },
    {
      pattern:
        /\b(?:[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+|PATH|HOME|SHELL|USER|TEMP|TMP|PWD)\b/g,
      trim: false,
    },
  ];
  const candidates: ProtectionCandidate[] = [];
  patterns.forEach(({ pattern, trim }, priority) => {
    for (const match of markdown.matchAll(pattern)) {
      const start = match.index;
      const length = trim ? trimCandidateEnd(match[0]) : match[0].length;
      const end = start + length;
      if (
        length === 0 ||
        internalRanges.some((range) => start < range.end && end > range.start)
      ) {
        continue;
      }
      candidates.push({ start, end, priority });
    }
  });
  candidates.sort(
    (left, right) =>
      left.start - right.start ||
      left.priority - right.priority ||
      right.end - right.start - (left.end - left.start),
  );

  let result = "";
  let cursor = 0;
  for (const candidate of candidates) {
    if (candidate.start < cursor) continue;
    result += markdown.slice(cursor, candidate.start);
    result += protect(markdown.slice(candidate.start, candidate.end));
    cursor = candidate.end;
  }
  return `${result}${markdown.slice(cursor)}`;
};

const protectLinkDestinations = (
  markdown: string,
  protect: (value: string) => string,
) => {
  let result = "";
  let cursor = 0;
  while (cursor < markdown.length) {
    const opening = markdown.indexOf("](", cursor);
    if (opening === -1) {
      result += markdown.slice(cursor);
      break;
    }

    const destinationStart = opening + 2;
    let valueStart = destinationStart;
    while (markdown[valueStart] === " " || markdown[valueStart] === "\t") {
      valueStart += 1;
    }
    result += markdown.slice(cursor, valueStart);

    if (markdown[valueStart] === "<") {
      const closingBracket = markdown.indexOf(">", valueStart + 1);
      if (closingBracket !== -1) {
        const value = markdown.slice(valueStart + 1, closingBracket);
        result += `<${value.length === 0 ? "" : protect(value)}>`;
        cursor = closingBracket + 1;
        continue;
      }
    }

    let depth = 0;
    let valueEnd = valueStart;
    while (valueEnd < markdown.length) {
      const character = markdown[valueEnd]!;
      if (character === "\\") {
        valueEnd = Math.min(valueEnd + 2, markdown.length);
        continue;
      }
      if (character === "(") {
        depth += 1;
      } else if (character === ")") {
        if (depth === 0) break;
        depth -= 1;
      } else if (/\s/.test(character)) {
        break;
      }
      valueEnd += 1;
    }

    const value = markdown.slice(valueStart, valueEnd);
    result += value.length === 0 ? "" : protect(value);
    cursor = valueEnd;
  }
  return result;
};

export const protectMarkdown = (markdown: string): ProtectedMarkdown => {
  if (PROTECTED_TOKEN_PATTERN.test(markdown)) {
    PROTECTED_TOKEN_PATTERN.lastIndex = 0;
    throw new Error("Source Markdown contains a reserved protected token");
  }
  PROTECTED_TOKEN_PATTERN.lastIndex = 0;

  const values = new Map<string, string>();
  const protect = (value: string) => {
    const internalToken = `\u0000ORCA_INTERNAL_${String(values.size + 1).padStart(6, "0")}\u0000`;
    values.set(internalToken, value);
    return internalToken;
  };

  let protectedMarkdown = protectFencedCode(markdown, protect);

  protectedMarkdown = protectedMarkdown.replace(
    /(`+)([^\r\n]*?)\1/g,
    (match, delimiter: string, value: string) =>
      value.length === 0 || value.includes("\u0000ORCA_INTERNAL_")
        ? match
        : `${delimiter}${protect(value)}${delimiter}`,
  );

  protectedMarkdown = protectLinkDestinations(protectedMarkdown, protect);

  protectedMarkdown = protectedMarkdown.replace(
    /https?:\/\/[^\s<>`"']+/gi,
    (candidate) => {
      let url = candidate;
      let suffix = "";
      const punctuation = url.match(/[.,;:!?]+$/)?.[0] ?? "";
      if (punctuation.length > 0) {
        url = url.slice(0, -punctuation.length);
        suffix = punctuation;
      }
      while (
        url.endsWith(")") &&
        (url.match(/\)/g)?.length ?? 0) > (url.match(/\(/g)?.length ?? 0)
      ) {
        url = url.slice(0, -1);
        suffix = `)${suffix}`;
      }
      return `${protect(url)}${suffix}`;
    },
  );

  protectedMarkdown = protectedMarkdown.replace(
    /^((?: {4,}[ \t]*|\t+[ \t]*))(\S[^\r\n]*)(?=\r?$)/gm,
    (_match, indentation: string, command: string) =>
      command.includes("\u0000ORCA_INTERNAL_")
        ? `${indentation}${command}`
        : `${indentation}${protect(command)}`,
  );

  protectedMarkdown = protectSemanticLiterals(protectedMarkdown, protect);

  const map: Record<string, string> = {};
  let tokenIndex = 0;
  protectedMarkdown = protectedMarkdown.replace(
    INTERNAL_TOKEN_PATTERN,
    (internalToken) => {
      const value = values.get(internalToken);
      if (value === undefined) {
        throw new Error("Unknown internal protection token");
      }

      tokenIndex += 1;
      const token = `ORCA_PROTECTED_${String(tokenIndex).padStart(4, "0")}`;
      map[token] = value;
      return token;
    },
  );
  INTERNAL_TOKEN_PATTERN.lastIndex = 0;

  if (tokenIndex !== values.size) {
    throw new Error("Failed to place every protected token");
  }

  return { markdown: protectedMarkdown, map };
};

export const restoreProtected = (
  markdown: string,
  map: Readonly<Record<string, string>>,
) => {
  const entries = Object.entries(map);
  for (const [token] of entries) {
    if (!VALID_PROTECTED_TOKEN_PATTERN.test(token)) {
      throw new Error(`Invalid protected token in map: ${token}`);
    }
  }

  const foundTokens = markdown.match(PROTECTED_TOKEN_PATTERN) ?? [];
  PROTECTED_TOKEN_PATTERN.lastIndex = 0;
  const expectedTokens = new Set(entries.map(([token]) => token));
  for (const token of foundTokens) {
    if (!expectedTokens.has(token)) {
      throw new Error(`Unknown protected token: ${token}`);
    }
  }

  for (const [token] of entries) {
    const count = foundTokens.filter((candidate) => candidate === token).length;
    if (count !== 1) {
      throw new Error(
        `Expected protected token ${token} exactly once, found ${count}`,
      );
    }
  }

  return markdown.replace(PROTECTED_TOKEN_PATTERN, (token) => map[token]!);
};
