import { onMicrophoneData } from "./index";

let recorder: MediaRecorder;

setTimeout(() => {
    const base = "grayscale(100%) sepia(100%) saturate(1000%) ";
    const red = base + "hue-rotate(-30deg)";
    const green = base + "hue-rotate(100deg)";

    const button = document.createElement("button");
    button.textContent = "🎤";
    button.className = "iconButton toggleButton offToggleButton unselectable";
    button.style.fontSize = "20px";
    button.style.filter = red;
    document.getElementById("leftControls").appendChild(button);

    let enabled = false;
    button.addEventListener("click", () => {
        enabled = !enabled;
        if (enabled) {
            button.style.filter = green;
            if (!recorder)
                initRecorder();
            else recorder.start(100);
        } else {
            button.style.filter = red;
            recorder.stop();
        }
    });
}, 5000);

async function initRecorder() {
    recorder = new MediaRecorder(
        await navigator.mediaDevices.getUserMedia({ audio: true }),
        { mimeType: 'audio/webm; codecs=opus', audioBitsPerSecond: 6000 }
    );
    recorder.addEventListener("dataavailable", onMicrophoneData);
    recorder.start(100);
}
