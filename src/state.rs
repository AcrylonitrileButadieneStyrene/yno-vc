use std::{collections::HashSet, sync::nonpoison::Mutex};

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct State {
    players: Mutex<HashSet<String>>,
}

#[wasm_bindgen]
impl State {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            players: Mutex::new(HashSet::new()),
        }
    }

    #[wasm_bindgen]
    pub fn init(&self) {}

    #[wasm_bindgen]
    pub fn on_player_join(self, uuid: String) -> bool {
        self.players.lock().insert(uuid)
    }

    #[wasm_bindgen]
    pub fn on_player_leave(self, uuid: String) -> bool {
        self.players.lock().remove(&uuid)
    }

    #[wasm_bindgen]
    pub fn on_players_cleared(self) {
        self.players.lock().clear();
    }
}
