export { }

declare global {
    interface Window {
        chatboxAddMessage(
            msg: string,
            type: number,
            player: string,
            ignoreNotify: boolean,
            mapId: number,
            prevMapId: number,
            prevLocationsStr: string,
            x: number,
            y: number,
            msgId: number,
            timestamp: any,
            shouldScroll: boolean
        ): void,
        showToastMessage(message: string, icon?: any, iconFill?: any, systemName?: string, persist?: boolean): HTMLDivElement,
        chatInputActionFired(): void,
        sendSessionCommand(command: string, commandParams: any[], callbackFunc?: Function, callbackCommand?: string): void,

        addOrUpdatePlayerListEntry(playerList: any | undefined, player: Player, showLocation: boolean, sortEntries: boolean): void,
        removePlayerListEntry(playerList: any | undefined, uuid: string): void,
        clearPlayerList(playerList: any | undefined): void,
    }
}

export interface Player {
    account: number, // bool
    badge: string | null,
    medals: number[], // max len 5
    name: string,
    rank: number,
    systemName: string,
    uuid: string,
}
