import { NetworkInfo } from "components/NetworkPlay/NetworkPlayController";
import { RemoteBattleService } from "components/NetworkPlay/RemoteBattleService";
import { BattleService } from "game/BattleService";

import React, { useEffect, useRef, useState } from "react";
import Battle from "../Battle/Battle";

interface Props {
    networkInfo: NetworkInfo
    onGameEnd: () => void;

}

const RemoteBattle: React.FunctionComponent<Props> = (props) => {
    let remoteBattleService = useRef<BattleService>();

    // eslint-disable-next-line
    const [forceUpdate, setForceUpdate] = useState<boolean>(false);

    const handleGameOver = () => {

        if (props.networkInfo.socket === undefined) {
            throw new Error(`could not find socket.... network connection is bad.`)
        }
        props.networkInfo.socket.emit("leave-game");
        props.onGameEnd();
    }

    useEffect(() => {
        remoteBattleService.current = new RemoteBattleService(props.networkInfo);
        setForceUpdate(prev => !prev);

    }, [props.networkInfo])

    const render = () => {

        if (remoteBattleService.current === undefined) {
            return <div>Waiting for server</div>
        }
        return <Battle onEnd={() => handleGameOver()} onLoad={() => remoteBattleService.current?.Initialize()} battle={remoteBattleService.current!} allyPlayerID={props.networkInfo.currentInGameId} />

    }

    return render();
}

export default RemoteBattle