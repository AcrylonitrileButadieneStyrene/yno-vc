use std::str::FromStr;

use iroh::{Endpoint, PublicKey, SecretKey, endpoint::Builder};
use wasm_bindgen::prelude::*;

const ALPN: &[u8] = b"yno_vc";

#[wasm_bindgen]
pub struct Network {
    builder: Builder,
}

#[wasm_bindgen]
impl Network {
    #[wasm_bindgen(constructor)]
    pub fn new(secret_key: Option<String>) -> Self {
        let mut builder = Endpoint::builder().alpns(vec![ALPN.to_vec()]);

        if let Some(secret_key) = secret_key
            && let Ok(secret_key) = SecretKey::from_str(&secret_key)
        {
            builder = builder.secret_key(secret_key.clone());
        }

        Self { builder }
    }

    #[wasm_bindgen]
    pub async fn init(self) -> Result<Networking, String> {
        match self.builder.bind().await {
            Ok(endpoint) => {
                endpoint.online().await;
                Ok(Networking { endpoint })
            }
            Err(err) => Err(crate::to_string(err)),
        }
    }
}

#[wasm_bindgen]
pub struct Networking {
    endpoint: Endpoint,
}

#[wasm_bindgen]
impl Networking {
    #[wasm_bindgen]
    pub fn get_secret_key(&self) -> String {
        data_encoding::HEXLOWER.encode(&self.endpoint.secret_key().to_bytes())
    }

    #[wasm_bindgen]
    pub fn get_public_key(&self) -> String {
        self.endpoint.secret_key().public().to_string()
    }

    pub async fn connect(&self, public_key: String) -> Result<crate::Connection, String> {
        let id = PublicKey::from_str(&public_key).unwrap();
        let connection = self
            .endpoint
            .connect(id, ALPN)
            .await
            .map_err(crate::to_string)?;

        let (mut send, receive) = connection.open_bi().await.map_err(crate::to_string)?;

        send.write_chunk(
            bincode::encode_to_vec(crate::PacketData::Hello, bincode::config::standard())
                .unwrap()
                .into(),
        )
        .await
        .map_err(crate::to_string)?;

        Ok(crate::Connection {
            public_key: Some(public_key),
            sender: Some(crate::Sender(send)),
            receiver: Some(crate::Receiver(receive)),
        })
    }

    pub async fn accept(&self) -> Result<crate::Connection, String> {
        let connection = self
            .endpoint
            .accept()
            .await
            .unwrap()
            .await
            .map_err(crate::to_string)?;
        let public_key = connection.remote_id().to_string();
        connection
            .accept_bi()
            .await
            .map(|(send, receive)| crate::Connection {
                public_key: Some(public_key),
                sender: Some(crate::Sender(send)),
                receiver: Some(crate::Receiver(receive)),
            })
            .map_err(crate::to_string)
    }
}
