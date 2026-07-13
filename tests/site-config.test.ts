import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("uses the Korean project Pages URL", async () => {
  const source = await readFile("astro.config.mjs", "utf8");
  expect(source).toContain("https://tz1012.github.io");
  expect(source).toContain('base: "/orca-docs-ko"');
  expect(source).toContain('title: "ORCA 한국어 문서"');
  expect(source).toContain('label: "한국어"');
  expect(source).toContain('lang: "ko"');
});

test("publishes the required source and rights metadata", async () => {
  const source = await readFile("src/content/docs/index.md", "utf8");
  expect(source).toContain(
    "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  );
  expect(source).toContain("https://www.onorca.dev/docs");
  expect(source).toContain("마지막 확인: 2026-07-13T01:34:57Z");
  expect(source).toContain(
    "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리 보유자에게 있습니다."
  );
});
