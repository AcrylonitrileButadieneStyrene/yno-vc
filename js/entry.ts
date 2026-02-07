import { Connection, Receiver, Sender } from "./wasm";

interface Audio {
    element: HTMLAudioElement,
    buffer?: SourceBuffer,
    media: MediaSource
    queue: any[],
}

export interface Entry {
    // immediately assigned by the connector
    // requires identification for the acceptor
    uuid?: string,

    public_key: string,
    send: Sender,
    receive: Receiver,

    audio: Audio,

    expiration?: any,
    shouldClose: boolean,
}

export const Entry = {
    new(connection: Connection): Entry {
        const audio: Audio = {
            element: document.createElement("audio"),
            buffer: undefined,
            media: undefined,
            queue: [],
        };

        audio.media = new MediaSource();
        audio.element.src = URL.createObjectURL(audio.media);
        audio.media.onsourceopen = () => {
            audio.buffer = audio.media.addSourceBuffer("audio/webm; codecs=opus");
            audio.buffer.mode = "sequence";
            audio.buffer.addEventListener("updateend", playAudio.bind(null, audio));
        };
        audio.element.play().catch(() => { });

        return {
            public_key: connection.take_public_key(),
            send: connection.take_send(),
            receive: connection.take_receive(),
            audio,
            shouldClose: false,
        };
    }
};

export function playAudio(audio: Audio) {
    try {
        if (!audio.queue.length || audio.buffer.updating)
            return;
        while (audio.queue.length > 10)
            audio.queue.shift()
        const data = audio.queue.shift();
        if (data) audio.buffer?.appendBuffer(data);
    } catch (e) {
        console.log("An error occured while playing audio:", e, audio.buffer.updating, audio.media.sourceBuffers, audio.element.error)
    }
}
