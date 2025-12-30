import * as glue from "../pkg/yno_vc_bg.js";
export * from "../pkg/yno_vc_bg.js";

import type * as Exports from "../pkg/yno_vc_bg.wasm.d.ts";

const blob = await GM.getResourceUrl("wasm");
const wasm = await fetch(blob);
const bytes = await wasm.arrayBuffer();
const module = await WebAssembly.compile(bytes);
const instance = await WebAssembly.instantiate(module, { "./yno_vc_bg.js": glue });
const exports = instance.exports as typeof Exports;

glue.__wbg_set_wasm(exports);
exports.__wbindgen_start();
