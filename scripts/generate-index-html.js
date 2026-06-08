/**
 * Post-build script to generate index.html in dist/client/
 * This is needed for static hosting fallbacks and SPA deployments.
 * In SSR mode (TanStack Start), the server generates HTML dynamically,
 * but having a static index.html is useful for certain deployment scenarios.
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const distClient = "dist/client";
const assetsDir = join(distClient, "assets");

function findAsset(pattern) {
  try {
    const files = readdirSync(assetsDir);
    return files.find((f) => pattern.test(f));
  } catch {
    return null;
  }
}

const cssFile = findAsset(/^styles-.*\.css$/);
const mainJsFile = findAsset(/^index-.*\.js$/) || findAsset(/^index-.*\.mjs$/);

const cssTag = cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : "";
const jsTag = mainJsFile ? `<script type="module" src="/assets/${mainJsFile}"></script>` : "";

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HN-DB — مركز إدارة قواعد البيانات</title>
    <meta name="description" content="HN-DB هو الوسيط الآمن لإدارة قواعد البيانات لكل مواقعك." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    ${cssTag}
  </head>
  <body>
    <div id="root"></div>
    ${jsTag}
  </body>
</html>
`;

writeFileSync(join(distClient, "index.html"), html);
console.log("✓ Generated dist/client/index.html");
