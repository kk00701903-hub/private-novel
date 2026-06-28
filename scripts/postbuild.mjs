import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const SITE_URL =
  process.env.VITE_SITE_URL ?? "https://kk00701903-hub.github.io/private-novel/";

function prepareGitHubPagesDist() {
  const distDir = resolve(process.cwd(), "dist");
  const indexPath = resolve(distDir, "index.html");

  let html;
  try {
    html = readFileSync(indexPath, "utf-8");
  } catch {
    console.warn("[postbuild] dist/index.html not found; skipping GitHub Pages prep");
    return;
  }

  if (html.includes("__SITE_URL__")) {
    html = html.replaceAll("__SITE_URL__", SITE_URL);
    writeFileSync(indexPath, html);
  }

  // GitHub Pages serves 404.html for unknown routes — copy SPA shell for client routing.
  copyFileSync(indexPath, resolve(distDir, "404.html"));
  console.log("[postbuild] wrote dist/404.html for GitHub Pages SPA routing");
}

prepareGitHubPagesDist();

const steps = [
  ["sitemap-routes", ["node", "scripts/generate-sitemap-routes.mjs"]],
  ["prerender", ["node", "scripts/prerender.mjs"]],
];

for (const [name, command] of steps) {
  const [bin, ...args] = command;
  const result = spawnSync(bin, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });

  if (result.status !== 0) {
    const exitCode = result.status ?? "unknown";
    console.warn(`[postbuild] ${name} skipped or failed with exit code ${exitCode}`);
    break;
  }
}
