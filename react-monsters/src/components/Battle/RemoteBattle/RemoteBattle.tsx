import { NetworkInfo } from "components/NetworkPlay/NetworkPlayController";
import { RemoteBattleService2 } from "components/NetworkPlay/RemoteBattleService";
import { BattleService, RemoteBattleService } from "game/BattleService";
import { PlayerBuilder } from "game/Player/PlayerBuilder";
import React, { useEffect, useRef, useState } from "react";
import { setConstantValue } from "typescript";
import Battle from "../Battle";

interface Props {
    networkInfo: NetworkInfo

}


const RemoteBattle: React.FunctionComponent<Props> = (props) => {
    let remoteBattleService = useRef<BattleService>();

    const [forceUpdate,setForceUpdate] = useState<boolean>(false);

    useEffect(() => {
            remoteBattleService.current = new RemoteBattleService2(props.networkInfo);
            setForceUpdate(prev=>!prev);
            
            console.log(remoteBattleService.current);
    }, [])

    const render = () => {

        if (remoteBattleService.current === undefined){
            return <div>Waiting for server</div>
        }
            return <Battle onLoad={()=>remoteBattleService.current?.Initialize()} onEnd={() => { }} battle={remoteBattleService.current!} allyPlayerID={props.networkInfo.currentInGameId} />
        
    }

    return render();
}

export default RemoteBattle