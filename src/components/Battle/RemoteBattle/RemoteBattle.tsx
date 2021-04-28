import  { BattleService, RemoteBattleService, RemoteBattleService2 } from "game/BattleService";
import React, {useRef } from "react";
import Battle from "../Battle";

interface Props{
    playerId:number
}

const createConnection = ()=>{
    let remoteBattleService = new RemoteBattleService();
    remoteBattleService.Initialize();
    return remoteBattleService;
}

const createConnection2 = ()=>{
    let remoteBattleService = new RemoteBattleService2();
    remoteBattleService.Initialize();
    return remoteBattleService;
}

const RemoteAIvsAIBattle: React.FunctionComponent<Props> = (props) => {
    let remoteBattleService = useRef<BattleService>();


    if (props.playerId === 1){
    remoteBattleService.current = createConnection();
    }
    else{
        remoteBattleService.current = createConnection2();
    }
    return  <Battle onEnd={()=>{}} battle={remoteBattleService.current} allyPlayerID={props.playerId} />
 }

 export default RemoteAIvsAIBattle