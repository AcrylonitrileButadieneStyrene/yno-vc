use wasm_bindgen::prelude::*;

mod connection;
mod networking;
mod packet;

pub use connection::{Connection, Receiver, Sender};
pub use networking::Networking;
pub use packet::{Packet, PacketData};

#[wasm_bindgen(start)]
fn main() {
    console_error_panic_hook::set_once();
    console_log::init_with_level(log::Level::Warn).unwrap();
}

pub fn to_string<T: ToString>(val: T) -> String {
    val.to_string()
}
