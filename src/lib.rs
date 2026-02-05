#![feature(nonpoison_mutex)]
#![feature(sync_nonpoison)]

use wasm_bindgen::prelude::*;

mod net;
mod state;

#[wasm_bindgen(start)]
fn main() {
    console_error_panic_hook::set_once();
    console_log::init_with_level(log::Level::Warn).unwrap();
}
