import { onPlayerJoin, onPlayerLeave } from "./index";

const players = new Set<string>();

export function patchPlayerEvents() {
    {
        const original = unsafeWindow.addOrUpdatePlayerListEntry;
        unsafeWindow.addOrUpdatePlayerListEntry = function (playerList, player) {
            if ((!playerList || playerList.id == "playerList") && !players.has(player.uuid)) {
                players.add(player.uuid);
                onPlayerJoin(player);
            }

            return original.apply(this, arguments);
        }
    }
    {
        const original = unsafeWindow.removePlayerListEntry;
        unsafeWindow.removePlayerListEntry = function (playerList, player) {
            if ((!playerList || playerList.id == "playerList") && players.has(player)) {
                players.delete(player);
                onPlayerLeave(player);
            }

            return original.apply(this, arguments);
        }
    }
    {
        const original = unsafeWindow.clearPlayerList;
        unsafeWindow.clearPlayerList = function (playerList) {
            if (!playerList || playerList.id == "playerList")
                players.forEach(player => onPlayerLeave(player))
            return original.apply(this, arguments);
        }
    }
}
