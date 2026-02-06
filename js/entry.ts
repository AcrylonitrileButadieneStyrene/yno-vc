import { Connection, Receiver, Sender } from "./wasm";

export interface Entry {
    // immediately assigned by the connector
    // requires identification for the acceptor
    player?: string,

    public_key: string,
    send: Sender,
    receive: Receiver,

    audio: {
        element: HTMLAudioElement,
        buffer?: SourceBuffer,
        queue: any[],
    },

    expiration?: any,
    shouldClose: boolean,
}

export const Entry = {
    new(connection: Connection): Entry {
        const audio = {
            element: document.createElement('audio'),
            buffer: undefined,
            media: undefined,
            queue: [],
        };

        audio.media = new MediaSource();
        audio.media.addEventListener('sourceopen', () => {
            const buffer = audio.media.addSourceBuffer('audio/webm; codecs=opus');
            audio.buffer = buffer;
            buffer.mode = 'sequence';
            buffer.addEventListener("updateend", playAudio.bind(null, audio));
        });
        audio.element.src = URL.createObjectURL(audio.media);
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

export function playAudio(audio: { element: HTMLAudioElement, buffer?: SourceBuffer, queue: any[] }) {
    try {
        if (!audio.queue.length || audio.buffer.updating)
            return;
        while (audio.queue.length > 10)
            audio.queue.shift()
        const data = audio.queue.shift();
        if (data) audio.buffer?.appendBuffer(data);
    } catch (e) { console.log(e) }
}
