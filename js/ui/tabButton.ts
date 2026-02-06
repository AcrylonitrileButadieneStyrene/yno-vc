const button = document.createElement("div");
button.id = "yno_vc_tab_button";
button.onclick = function () { window.setPlayersTab(this, false); };
button.className = "playersTab subTab";

const small = document.createElement("small");
small.className = "playersTabLabel subTabLabel infoLabel unselectable";
small.textContent = "Voice";
button.appendChild(small);

const bg = document.createElement("div");
bg.className = "subTabBg";
button.appendChild(bg);

document.getElementById("playersTabs").appendChild(button);

export { };
