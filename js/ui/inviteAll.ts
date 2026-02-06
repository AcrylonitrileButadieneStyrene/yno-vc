import { public_key } from "..";
import { Tab } from "./tab";

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const invite = document.createElement("button");
invite.textContent = "Invite all players in this map";
invite.onclick = async () => {
    const chatInput = document.getElementById("chatInput") as HTMLInputElement;
    invite.disabled = true;
    chatInput.style.outline = "solid 4px #08f"
    const original = chatInput.value;
    const target = `/voice:${public_key}`;

    for (let i = 0; i < target.length; i++) {
        chatInput.value = target.slice(0, i);
        await sleep(i == 6 ? 200 : 10);
    }

    await sleep(250);

    unsafeWindow.sendSessionCommand("say", [target]);
    chatInput.style.outline = "";
    chatInput.value = original;

    await sleep(5_000);
    invite.disabled = false;
}
Tab.appendChild(invite);