import { Button, Card } from "antd";
import React from "react"
import NetworkPlayerInfo from "./NetworkPlayer";

interface Props {
    player:NetworkPlayerInfo,
    onChallengeClick:(player:string)=>void
}


const PlayerProfile = (props: Props) => {
    return (<Card>
        <div>{props.player.name}</div>
        <div>{props.player.onlineStatus}</div>
        <div><Button onClick={()=>props.onChallengeClick(props.player.name)}>Challenge!</Button></div>
    </Card>)
}


export default PlayerProfile