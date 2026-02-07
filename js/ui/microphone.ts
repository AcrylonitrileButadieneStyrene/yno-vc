import { onMicrophoneData } from "../index";

export let recorder: MediaRecorder;

const button = document.createElement("button");
button.textContent = "V";
button.className = "iconButton toggleButton offToggleButton unselectable";
button.style.fontSize = "22px";
button.style.color = "red";
document.getElementById("leftControls").appendChild(button);

let enabled = false;
button.addEventListener("click", () => {
    enabled = !enabled;
    if (enabled) {
        button.style.color = "green";
        if (!recorder)
            initRecorder();
        recorder.start(100);
    } else {
        button.style.color = "red";
        recorder.stop();
    }
});

async function initRecorder() {
    recorder = new MediaRecorder(
        await navigator.mediaDevices.getUserMedia({ audio: true }),
        { mimeType: 'audio/webm; codecs=opus', audioBitsPerSecond: 6000 }
    );
    recorder.addEventListener("dataavailable", onMicrophoneData);
}

export function restartRecorder() {
    if (enabled) recorder?.start();
}

export function stopRecorder() {
    recorder.stop();
}
