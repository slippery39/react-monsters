//These are shared interfaces and should be used with the front end and backend code.

export enum NetworkPlayerStatus{
    Online = 'online',
    InGame = 'in-game',
    Offline = 'offline'
}

export interface NetworkPlayerInfo{
    name:string,
    onlineStatus:NetworkPlayerStatus
}

export default NetworkPlayerInfo