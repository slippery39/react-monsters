import BattleService, { GameEventHandler, RemoteBattleService } from "game/BattleService";
import { PlayerBuilder } from "game/Player/PlayerBuilder";
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
    let eventHandler = useRef<GameEventHandler>();
    eventHandler.current = createConnection();
    const battleService = new BattleService(new PlayerBuilder(1).Build(),new PlayerBuilder(2).Build(),true);
    return  <Battle onEnd={()=>{}} battle={battleService} gameEventHandler={eventHandler.current} allyPlayerID={2} />
 }

 export default RemoteAIvsAIBattle