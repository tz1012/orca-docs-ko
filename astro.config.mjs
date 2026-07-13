import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sidebar from "./mirror/sidebar.json" with { type: "json" };

export default defineConfig({
  site: "https://tz1012.github.io",
  base: "/orca-docs-ko",
  integrations: [starlight({
    title: "ORCA 한국어 문서",
    defaultLocale: "ko",
    locales: { ko: { label: "한국어", lang: "ko" } },
    sidebar,
    components: { PageTitle: "./src/components/PageTitle.astro" },
    customCss: ["./src/styles/custom.css"]
  })]
});
