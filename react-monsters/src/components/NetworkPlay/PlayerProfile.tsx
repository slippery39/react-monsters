import { Button, Card } from "antd";
import React from "react"
import NetworkPlayerInfo, { NetworkPlayerStatus } from "./NetworkPlayer";
import "./PlayerProfile.css";

interface Props {
    player:NetworkPlayerInfo,
    onChallengeClick:(player:string)=>void
}


const PlayerProfile = (props: Props) => {

    let onlineStatusClass = "";

    if (props.player.onlineStatus === NetworkPlayerStatus.Online){
        onlineStatusClass = "player-profile-online";
    }
    if (props.player.onlineStatus === NetworkPlayerStatus.InGame){
        onlineStatusClass = "player-profile-in-game";
    }

    return (<Card>
        <div>{props.player.name}</div>
        <div className={onlineStatusClass}>{props.player.onlineStatus}</div>
        {props.player.onlineStatus!== NetworkPlayerStatus.InGame &&<div><Button onClick={()=>props.onChallengeClick(props.player.name)}>Challenge!</Button></div>
    }    </Card>)
}


export default PlayerProfile