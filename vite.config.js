import { defineConfig } from "vite"
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tla from 'rollup-plugin-tla';
import monkey from "vite-plugin-monkey"

import * as manifest from "./package.json";

export default defineConfig({
    build: {
        lib: {
            name: manifest.name,
            entry: "js/index.ts",
            fileName: "index",
            formats: ["iife"],
        },
        minify: true,
    },
    esbuild: {
        banner: `/*
 * This file has been minified to reduce its file size.
 * A readable copy of the code is accessible at the link in the @repository tag above.
 */`,
        footer: ``,
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: `pkg/${manifest.name}_bg.wasm`,
                    dest: ".",
                    rename: `${manifest.name}.wasm`
                }
            ]
        }),
        tla(),
        monkey({
            entry: "js/index.ts",
            userscript: manifest.userscript,
            build: {
                metaFileName: true,
            }
        }),
    ],
});