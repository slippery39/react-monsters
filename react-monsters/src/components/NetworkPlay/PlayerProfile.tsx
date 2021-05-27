import { Button, Card, message } from "antd"

import React, { useEffect, useState } from "react"
import { NetworkInfo } from "./NetworkPlayController";
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