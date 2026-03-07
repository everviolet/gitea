#!/usr/bin/env -S deno run -A

import * as path from "@std/path";
import * as sass from "sass";
import palette from "palette.json" with { type: "json" };

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const accents = Object.entries(palette.winter.colors)
  .filter(([_, { accent }]) => accent)
  .map(([accentName]) => accentName);

Deno.mkdirSync(path.join(__dirname, "dist"), { recursive: true });

const sassBuilder = (variant: string, accent: string) => `
@import "@everviolet/palette/scss/${variant}.scss";
$accent: $${accent};
$isDark: ${variant !== "summer"};
@import "theme";
`;

const renameColors = (c) => {
  return c
    .replace(/peach/g, 'orange')
    .replace(/lavender/g, 'snow')
    .replace(/mauve/g, 'purple')
    .replace(/flamingo/g, 'cherry')
    .replace(/rosewater/g, 'cherry')
    .replace(/sky/g, 'skye')
    .replace(/maroon/g, 'red')
    .replace(/teal/g, 'aqua');
};

const srcDir = path.join(__dirname, "src");
for await (const dirEntry of Deno.readDir(srcDir)) {
  if (dirEntry.isFile) {
    const filePath = path.join(srcDir, dirEntry.name);
    const content = await Deno.readTextFile(filePath);
    const newContent = renameColors(content);
    await Deno.writeTextFile(filePath, newContent);
  }
}

Object.entries(palette).forEach(([variantName, variant]) => {
  if (!variant.colors || Object.keys(variant.colors).length === 0) {
    console.warn(`no colors in ${variantName}`);
    return;
  }

  Object.entries(variant.colors)
    .filter(([_, { accent }]) => accent)
    .forEach(([accentName]) => {
      const input = sassBuilder(variantName, accentName);
      const result = sass.compileString(input, {
        loadPaths: [
          path.join(__dirname, "src"),
          path.join(__dirname, "node_modules"),
        ],
      });

      Deno.writeTextFileSync(
        path.join(
          __dirname,
          "dist",
          `theme-evergarden-${variantName}-${accentName}.css`,
        ),
        result.css,
      );

      Deno.writeTextFileSync(
        path.join(__dirname, "dist", `theme-evergarden-${accentName}-auto.css`),
        `@import "./theme-evergarden-summer-${accentName}.css" (prefers-color-scheme: light);
@import "./theme-evergarden-winter-${accentName}.css" (prefers-color-scheme: dark);`,
      );
    });
});
