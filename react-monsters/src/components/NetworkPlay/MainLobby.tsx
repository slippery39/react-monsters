import { Card, message } from "antd"

import React, { useEffect, useState } from "react"
import { NetworkInfo } from "./NetworkPlayController";
import PlayerProfile from "./PlayerProfile";

interface Props {
    networkInfo: NetworkInfo
}


const MainLobby = (props: Props) => {
    const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);


    const handleUsersChanged = (players: string[]) => {
        setOnlinePlayers(players);
    }

    const onChallengeClick = ((player: string) => {
        //TODO: do not handle is user clicked is the connected user.
        console.log(player);
        props.networkInfo.socket!.emit("challenge-request", {
            player1: props.networkInfo.currentPlayer,
            player2: player
        })
    })

    useEffect(() => {
        (async () => {
            const response = await fetch(props.networkInfo.serverAddress + "/getOnlineUsers", {
                method: 'GET',
                headers: { 'content-type': 'application/json;charset=UTF-8', }
            });
            const resJSON = await response.json();

            setOnlinePlayers(resJSON.users);
        }
        )();

        props.networkInfo.socket!.on("users-changed", handleUsersChanged);

        return () => {
            props.networkInfo.socket!.off("users-changed", handleUsersChanged);
        }

    }, []);

    useEffect(() => {
        props.networkInfo.socket!.on("challenge-request-received", (options) => {
            message.info(`${options.player1} has challenged you to a battle!`)
        });
    }, []);

    const otherPlayerList = onlinePlayers
        .filter(player => player !== props.networkInfo.currentPlayer)
        .map(player => <PlayerProfile onChallengeClick={onChallengeClick} player={player}></PlayerProfile>)


    return (<Card>
        <div>Main Lobby</div>
        <div>Players online: {onlinePlayers.length}</div>
        {otherPlayerList.length === 0 ? <div>No other players are online!</div> : otherPlayerList}
    </Card>)
}


export default MainLobby