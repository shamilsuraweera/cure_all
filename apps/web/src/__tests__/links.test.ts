import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const srcDir = join(__dirname, "..");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory())
      return name === "__tests__" ? [] : walk(full);
    return full.endsWith(".tsx") ? [full] : [];
  });

const routePatterns = [
  ...readFileSync(join(srcDir, "app.tsx"), "utf8").matchAll(/path="([^"]+)"/g),
]
  .map((m) => m[1])
  .concat("/")
  .filter((p) => p !== "*")
  .map((p) => new RegExp(`^${p.replace(/:[^/]+/g, "[^/]+")}$`));

describe("internal links", () => {
  it("every static link target matches a defined route", () => {
    const bad: string[] = [];
    for (const file of walk(srcDir)) {
      const text = readFileSync(file, "utf8");
      const targets = [
        ...text.matchAll(/\bto="(\/[^"]*)"/g),
        ...text.matchAll(/\bto=\{`(\/[^`]*)`\}/g),
        ...text.matchAll(/navigate\("(\/[^"]*)"/g),
      ].map((m) => m[1].replace(/\$\{[^}]*\}/g, "x").split("?")[0]);
      for (const target of targets) {
        if (!routePatterns.some((re) => re.test(target)))
          bad.push(`${file}: ${target}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
