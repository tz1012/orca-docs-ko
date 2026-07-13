import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("uses the Korean project Pages URL", async () => {
  const source = await readFile("astro.config.mjs", "utf8");
  expect(source).toContain("https://tz1012.github.io");
  expect(source).toContain('base: "/orca-docs-ko"');
  expect(source).toContain('lang: "ko"');
});
