import { Button, Card, message } from "antd"

import React, { useEffect, useState } from "react"
import { NetworkInfo } from "./NetworkPlayController";

interface Props {
    player:string,
    onChallengeClick:(player:string)=>void
}


const PlayerProfile = (props: Props) => {
    return (<Card>
        <div>{props.player}</div>
        <div>Online</div>
        <div><Button onClick={()=>props.onChallengeClick(props.player)}>Challenge!</Button></div>
    </Card>)
}


export default PlayerProfile