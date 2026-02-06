import { State } from "./wasm";
import { onPlayerJoin, onPlayerLeave, onPlayersCleared } from "./index";

export function patchPlayerEvents(state: State) {
    patch("addOrUpdatePlayerListEntry", player => player?.uuid && state.on_player_join(player.uuid) && onPlayerJoin(player.uuid));
    patch("removePlayerListEntry", player => player && state.on_player_leave(player) && onPlayerLeave(player));
    patch("clearPlayerList", () => (state.on_players_cleared(), onPlayersCleared()));
}

function patch(key: string, callback: (player: any) => void) {
    const original = unsafeWindow[key];
    unsafeWindow[key] = function (playerList: HTMLElement | undefined, player: any) {
        if (!playerList || playerList.id == "playerList")
            callback(player);
        return original.apply(this, arguments);
    };
}
