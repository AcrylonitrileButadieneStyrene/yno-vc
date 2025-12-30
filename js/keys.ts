
const keys = (await GM.getValue("keys")) || {};
const duplicates = new Set();
const seen = new Set();
for (const key of Object.values(keys)) {
    if (seen.has(key))
        duplicates.add(key);
    else seen.add(key);
}

const forward = {};
const reverse = {};
for (const [player, key] of Object.entries(keys)) {
    if (duplicates.has(key))
        continue;

    forward[player] = key;
    reverse[key] = player
}

export function getKeyForPlayer(player: string): string | undefined {
    return forward[player];
}

export function getPlayerForKey(key: string): string | undefined {
    return reverse[key];
}

export function setKey(player: string, key: string) {
    keys[player] = key;
    forward[player] = key;
    reverse[key] = player;
    GM.setValue("keys", keys);
}
