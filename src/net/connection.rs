use iroh::endpoint::{RecvStream, SendStream};
use wasm_bindgen::prelude::*;

const MAX_SIZE: usize = 4096;

#[wasm_bindgen]
pub struct Connection {
    pub(crate) public_key: Option<String>,
    pub(crate) sender: Option<Sender>,
    pub(crate) receiver: Option<Receiver>,
}

#[wasm_bindgen]
impl Connection {
    pub fn take_public_key(&mut self) -> Option<String> {
        self.public_key.take()
    }

    #[wasm_bindgen]
    pub fn take_send(&mut self) -> Option<Sender> {
        self.sender.take()
    }

    #[wasm_bindgen]
    pub fn take_receive(&mut self) -> Option<Receiver> {
        self.receiver.take()
    }
}

#[wasm_bindgen]
pub struct Sender(pub(crate) SendStream);

#[wasm_bindgen]
pub struct Receiver(pub(crate) RecvStream);

#[wasm_bindgen]
impl Sender {
    #[wasm_bindgen]
    pub async fn send(&mut self, packet: JsValue) -> Result<(), String> {
        let packet: super::PacketData =
            serde_wasm_bindgen::from_value(packet).map_err(super::to_string)?;

        let bytes = bincode::encode_to_vec(packet, bincode::config::standard()).unwrap();
        if bytes.len() > MAX_SIZE {
            Err(format!("packet encoding too large: {} bytes", bytes.len()))
        } else {
            self.0
                .write_chunk(bytes.into())
                .await
                .map_err(super::to_string)
        }
    }
}

#[wasm_bindgen]
impl Receiver {
    #[wasm_bindgen]
    pub async fn read(&mut self) -> Result<JsValue, String> {
        let chunk = self
            .0
            .read_chunk(MAX_SIZE)
            .await
            .map_err(super::to_string)?
            .ok_or_else(|| "no chunk".to_string())?;

        let (data, _) = bincode::decode_from_slice::<super::PacketData, _>(
            &chunk.bytes,
            bincode::config::standard(),
        )
        .map_err(super::to_string)?;

        serde_wasm_bindgen::to_value(&super::Packet {
            data,
            offset: chunk.offset,
        })
        .map_err(super::to_string)
    }
}
