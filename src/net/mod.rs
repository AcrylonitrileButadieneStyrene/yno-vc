mod connection;
mod networking;
mod packet;

pub use connection::{Connection, Receiver, Sender};
pub use packet::{Packet, PacketData};

pub fn to_string<T: ToString>(val: T) -> String {
    val.to_string()
}
