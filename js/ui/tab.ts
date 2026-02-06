export const Tab = document.createElement("div");
Tab.id = "yno_vc_tab";
Tab.className = "playerList chatboxTabContent scrollableContainer";

export const Players = document.createElement("div");
Players.style.flex = "1";
Tab.appendChild(Players);

document.getElementById("players").appendChild(Tab);

const style = document.createElement("style");
style.textContent = `
    #yno_vc_tab {
        display: none;
    }

    body:has(#yno_vc_tab_button.active) #playerList {
        display:none;
    }

    body:has(#yno_vc_tab_button.active) #yno_vc_tab {
        display: flex;
        flex-direction: column-reverse;
    }
`;
document.head.appendChild(style);
