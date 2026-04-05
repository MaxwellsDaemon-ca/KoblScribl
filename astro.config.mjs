import { defineConfig } from "astro/config";
import remarkDirective from "remark-directive";
import remarkTexting from "./src/plugins/remark-texting.js";
import remarkParsel from "./src/plugins/remark-parseltongue.js";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkDirective, remarkTexting, remarkParsel],
  },
});