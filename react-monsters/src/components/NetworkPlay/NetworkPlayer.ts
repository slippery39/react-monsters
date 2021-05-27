export enum NetworkPlayerStatus{
    Online = 'online',
    InGame = 'in game',
    Offline = 'offline'
}

export interface NetworkPlayerInfo{
    name:string,
    onlineStatus:NetworkPlayerStatus
}

export default NetworkPlayerInfo