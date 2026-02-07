import { defineConfig } from "vite"
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tla from 'rollup-plugin-tla';
import monkey from "vite-plugin-monkey"

import * as manifest from "./package.json";

export default defineConfig(({ mode }) => ({
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
        banner: ""
            + "/* This file has been minified to reduce its file size.\n"
            + " * A readable copy of the code is accessible at the link in the @source tag above.\n"
            + " */",
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
            userscript: {
                ...manifest.userscript,
                resource: {
                    wasm: mode == "production"
                        ? "https://raw.githubusercontent.com/AcrylonitrileButadieneStyrene/yno-vc/refs/heads/builds/yno_vc.wasm?version=" + manifest.version
                        : "http://localhost:3000/yno_vc.wasm?nonce=" + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
                }
            },
            build: {
                metaFileName: true,
            }
        }),
    ],
}));