build-rust:
    wasm-pack build

build-js:
    npx vite build --mode dev

build-all: build-rust build-js
