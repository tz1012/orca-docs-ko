const PROTECTED_TOKEN_PATTERN = /\bORCA_PROTECTED_[A-Za-z0-9_]+\b/g;
const VALID_PROTECTED_TOKEN_PATTERN = /^ORCA_PROTECTED_\d{4,}$/;
const INTERNAL_TOKEN_PATTERN = /\u0000ORCA_INTERNAL_(\d{6,})\u0000/g;

export type ProtectedMarkdown = {
  markdown: string;
  map: Record<string, string>;
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

  let protectedMarkdown = markdown.replace(
    /(^|\r?\n)([ \t]*)(`{3,}|~{3,})([^\r\n]*)(\r?\n)([\s\S]*?)(\r?\n)\2\3([ \t]*)(?=\r?\n|$)/g,
    (
      match,
      prefix: string,
      indentation: string,
      fence: string,
      info: string,
      openingNewline: string,
      body: string,
      closingNewline: string,
      trailing: string,
    ) =>
      body.length === 0
        ? match
        : `${prefix}${indentation}${fence}${info}${openingNewline}${protect(body)}${closingNewline}${indentation}${fence}${trailing}`,
  );

  protectedMarkdown = protectedMarkdown.replace(
    /(`+)([^\r\n]*?)\1/g,
    (match, delimiter: string, value: string) =>
      value.length === 0 || value.includes("\u0000ORCA_INTERNAL_")
        ? match
        : `${delimiter}${protect(value)}${delimiter}`,
  );

  protectedMarkdown = protectLinkDestinations(protectedMarkdown, protect);

  protectedMarkdown = protectedMarkdown.replace(
    /https?:\/\/[^\s<>\[\]`"']+/gi,
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
    /^( {4}|\t)(\S[^\r\n]*)(?=\r?$)/gm,
    (_match, indentation: string, command: string) =>
      command.includes("\u0000ORCA_INTERNAL_")
        ? `${indentation}${command}`
        : `${indentation}${protect(command)}`,
  );

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
