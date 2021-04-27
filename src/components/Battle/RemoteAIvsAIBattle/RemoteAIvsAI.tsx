import  { BattleService, RemoteBattleService } from "game/BattleService";
import React, {useRef } from "react";
import Battle from "../Battle";

interface Props{
}

const createConnection = ()=>{
    var remoteBattleService = new RemoteBattleService();
    remoteBattleService.Initialize();
    return remoteBattleService;
}

const RemoteAIvsAIBattle: React.FunctionComponent<Props> = (props) => {
    let remoteBattleService = useRef<BattleService>();
    remoteBattleService.current = createConnection();
    return  <Battle onEnd={()=>{}} battle={remoteBattleService.current} allyPlayerID={1} />
 }

 export default RemoteAIvsAIBattle