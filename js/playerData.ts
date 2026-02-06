import { Player } from "./globals";

let globalPlayerData = {};

export function initPlayerData() {
    globalPlayerData = unsafeWindow["eval"]("globalPlayerData");
}

export function resolvePlayer(uuid: string): Player {
    return globalPlayerData[uuid];
}
