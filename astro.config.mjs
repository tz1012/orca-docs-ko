import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sidebar from "./mirror/sidebar.json" with { type: "json" };

export default defineConfig({
  site: "https://tz1012.github.io",
  base: "/orca-docs-ko",
  redirects: {
    "/": "/orca-docs-ko/docs/",
  },
  integrations: [starlight({
    title: "ORCA 한국어 문서",
    defaultLocale: "root",
    locales: { root: { label: "한국어", lang: "ko" } },
    sidebar,
    head: [
      {
        tag: "script",
        attrs: {
          defer: true,
          "data-goatcounter": "https://orca-docs-ko.goatcounter.com/count",
          src: "//gc.zgo.at/count.js",
        },
      },
    ],
    components: {
      PageTitle: "./src/components/PageTitle.astro",
      DraftContentNotice: "./src/components/DraftContentNotice.astro"
    },
    customCss: ["./src/styles/custom.css"]
  })]
});
