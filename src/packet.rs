#[derive(serde::Serialize, serde::Deserialize)]
pub struct Packet {
    pub offset: u64,
    #[serde(flatten)]
    pub data: PacketData,
}

#[derive(bincode::Encode, bincode::Decode, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum PacketData {
    Hello,
    Identify,
    VoiceData(Vec<u8>),
}
