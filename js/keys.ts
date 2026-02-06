
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
for (const [uuid, key] of Object.entries(keys)) {
    if (duplicates.has(key))
        continue;

    forward[uuid] = key;
    reverse[key] = uuid;
}

export function getKeyForUuid(uuid: string): string | undefined {
    return forward[uuid];
}

export function getUuidForKey(key: string): string | undefined {
    return reverse[key];
}

export function setKey(uuid: string, key: string) {
    keys[uuid] = key;
    forward[uuid] = key;
    reverse[key] = uuid;
    GM.setValue("keys", keys);
}
