import { readFile } from "node:fs/promises";

import { parse as parseYaml } from "yaml";
import { expect, test } from "vitest";

type Workflow = {
  name?: string;
  on?: Record<string, unknown>;
  permissions?: Record<string, string>;
  concurrency?: Record<string, unknown>;
  jobs?: Record<string, {
    needs?: string;
    permissions?: Record<string, string>;
    environment?: Record<string, string>;
    steps?: Array<Record<string, unknown>>;
  }>;
};

const readWorkflow = async (name: string) =>
  parseYaml(await readFile(`.github/workflows/${name}`, "utf8")) as Workflow;

test("validates the mirror on pull requests and main pushes", async () => {
  const workflow = await readWorkflow("test.yml");

  expect(workflow.on).toEqual({
    pull_request: null,
    push: { branches: ["main"] },
  });
  const steps = workflow.jobs?.validate?.steps ?? [];
  expect(steps.map((step) => step.uses).filter(Boolean)).toEqual([
    "actions/checkout@v7",
    "pnpm/action-setup@v6",
    "actions/setup-node@v6",
  ]);
  expect(steps[1]).toMatchObject({ with: { version: "11.7.0" } });
  expect(steps[2]).toMatchObject({
    with: { "node-version": 24, cache: "pnpm" },
  });
  expect(steps.map((step) => step.run).filter(Boolean)).toEqual([
    "pnpm install --frozen-lockfile",
    "pnpm test",
    "pnpm check",
    "pnpm mirror:check",
    "pnpm build",
  ]);
});

test("builds and deploys GitHub Pages with the required permissions", async () => {
  const workflow = await readWorkflow("deploy.yml");

  expect(workflow.on).toEqual({
    push: { branches: ["main"] },
    workflow_dispatch: null,
  });
  expect(workflow.permissions).toEqual({
    contents: "read",
    pages: "write",
    "id-token": "write",
  });
  expect(workflow.concurrency).toEqual({
    group: "pages",
    "cancel-in-progress": true,
  });
  expect(workflow.jobs?.build?.steps).toEqual([
    { uses: "actions/checkout@v7" },
    {
      uses: "withastro/action@v6",
      with: { "node-version": 24, "package-manager": "pnpm@11.7.0" },
    },
  ]);
  expect(workflow.jobs?.deploy).toMatchObject({
    needs: "build",
    environment: {
      name: "github-pages",
      url: "${{ steps.deployment.outputs.page_url }}",
    },
    steps: [
      { id: "deployment", uses: "actions/deploy-pages@v5" },
    ],
  });
});
