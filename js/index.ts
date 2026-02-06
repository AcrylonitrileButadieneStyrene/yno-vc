import { Connection, Network, State } from "./wasm";
import { Entry, playAudio } from "./entry";
import { getKeyForPlayer, setKey } from "./keys";
import { Player } from "./globals";
import { patchPlayerEvents } from "./playerlist";
import "./ui";

const key: string | undefined = await GM.getValue("secret_key");
const net = await new Network(key).init();
if (key == undefined)
    GM.setValue("secret_key", net.get_secret_key());
export const public_key = net.get_public_key();

const state = new State();

const connections = new Set<Entry>();

const checkInterval = setInterval(() => {
    if (!unsafeWindow.chatboxAddMessage)
        return;
    clearInterval(checkInterval);

    state.init();
    patchChatSend();
    patchChatReceive();
    patchPlayerEvents(state);
}, 1_000);

function patchChatSend() {
    const original = unsafeWindow.chatInputActionFired;
    unsafeWindow.chatInputActionFired = function () {
        const input = document.getElementById("chatInput") as HTMLInputElement;
        if (!input.dataset.global && input.value.trim() == "/voice.join")
            input.value = `/voice.join:${public_key}`;

        return original.apply(this, arguments);
    };
}

function patchChatReceive() {
    const original = unsafeWindow.chatboxAddMessage;
    unsafeWindow.chatboxAddMessage = function (msg, _, player) {
        const parts = msg.split(":");
        if (parts[0] == "/voice.join") {
            const key = parts[1];
            if (key != public_key) {
                setKey(player, key);
                connect(player, key);
            }
        } else if (parts[0] == "/voice.identify") {
            const key = parts[1];
            if (key != public_key) {
                setKey(player, key);

                const entry = [...connections].find(entry => entry.public_key == key);
                if (entry) entry.player = player;
                else console.warn(`No connection found for ${player}`);
            }
        }

        return original.apply(this, arguments);
    };
}

let outgoing = new Set();
async function connect(player: string, key: string) {
    if (key == public_key)
        return;
    if (outgoing.has(key))
        return;
    if ([...connections].find(entry => entry.player == player || entry.public_key == key))
        return;

    console.log(`Connecting to ${key}`)
    outgoing.add(key);
    net.connect(key).then(connection => {
        console.log(`Connected to ${key}`);
        setupConnection(true, connection).player = player;
    }).catch(() => {
        console.log(`Failed to connect to ${key}`);
    }).then(() => {
        outgoing.delete(key)
    });
}

(async function () {
    for (; ;) {
        await net.accept().then(setupConnection.bind(null, false)).catch(err => {
            console.log(`Failed accepting connection: ` + err)
        })
    }
})()

function setupConnection(initiating: boolean, connection: Connection): Entry {
    const entry = Entry.new(initiating, connection);
    receiveLoop(entry);
    connections.add(entry);
    return entry;
}

function closeConnection(entry: Entry, message?: string) {
    connections.delete(entry);
    if (message) {
        message = message.replaceAll("%player%", entry?.player || "an unidentified player");

        console.log(message);
    }
}

async function trySend(entry: Entry, packet: { type: string, data?: any }) {
    try {
        await entry.send.send(packet);
    } catch (err) {
        closeConnection(entry, `Voice disconnected %player% due to send error ${err}`);
    }
}

async function receiveLoop(entry: Entry) {
    try {
        for (; ;) {
            const packet = await entry.receive.read();
            const type = packet.get("type");
            const data = packet.get("data");

            (({
                Hello() {
                    entry.player = getKeyForPlayer(entry.public_key);
                    if (!entry.player)
                        trySend(entry, { type: "Identify" })
                },
                Identify() {
                    if (entry.identify !== true)
                        return closeConnection(entry, `Voice disconnected %player% due to requesting identification`);
                    entry.identify = false;
                    unsafeWindow.sendSessionCommand("say", ["/voice.identify:" + public_key])
                },
                VoiceData(data: any) {
                    const sound = new Uint8Array(data);
                    const { queue, element } = entry.audio;
                    queue.push(sound);

                    if (element.paused)
                        element.play().catch(() => { });
                    playAudio(entry.audio);
                },
            })[type] || (() => {
                // unreachable unless programmer error
                throw `unexpected ${type} packet`;
            }))(data);
        }
    }
    catch (err) {
        closeConnection(entry, `Voice disconnected %player% due to receive error ${err}`);
    }
}

export async function onMicrophoneData(event: BlobEvent) {
    if (!event.data.size) return;

    const packet = { type: "VoiceData", data: Array.from(await event.data.bytes()) };

    const promises = [...connections]
        .map((entry) => trySend(entry, packet));
    for (const promise of promises) {
        await promise;
    }
}

export function onPlayerJoin(player: Player) {
    const entry = [...connections].find(entry => entry.player == player.uuid);
    if (entry) {
        if (entry.expiration) {
            clearTimeout(entry.expiration)
            entry.expiration = undefined;
        }
    } else {
        const key = getKeyForPlayer(player.uuid);
        if (!key) return;
        if (key >= public_key)
            return; // let them connect to us instead

        connect(player.uuid, key);
    }
}

export function onPlayerLeave(player: string) {
    const entry = [...connections].find(entry => entry.player == player);
    if (!entry) return;

    entry.expiration = setTimeout(() => {
        connections.delete(entry);
    }, 30_000);
}

export function onPlayersCleared() {
    for (const connection of [...connections]) {
        connection.expiration = setTimeout(() => {
            connections.delete(connection);
        }, 30_000);
    }
}
