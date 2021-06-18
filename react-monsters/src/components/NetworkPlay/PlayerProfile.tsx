import { Button, Card } from "antd";
import NetworkPlayerInfo, { NetworkPlayerStatus } from "game/NetworkPlay/NetworkPlayer";
import React from "react"
import "./PlayerProfile.css";

interface Props {
    player: NetworkPlayerInfo,
    onChallengeClick: (player: string) => void
}


const PlayerProfile = (props: Props) => {

    let onlineStatusClass = "";

    if (props.player.onlineStatus === NetworkPlayerStatus.Online) {
        onlineStatusClass = "player-profile-online";
    }
    if (props.player.onlineStatus === NetworkPlayerStatus.InGame) {
        onlineStatusClass = "player-profile-in-game";
    }

    const getOnlineStatusText = (status: NetworkPlayerStatus) => {
        let statusMap = new Map<NetworkPlayerStatus, string>();

        statusMap.set(NetworkPlayerStatus.Online, "Online");
        statusMap.set(NetworkPlayerStatus.InGame, "In Game");
        statusMap.set(NetworkPlayerStatus.Offline, "Offline");

        if (statusMap.has(status)) {
            return statusMap.get(status);
        }
        else {
            return "Invalid Status";
        }

    }

    return (<Card>
        <div>{props.player.name}</div>
        <div className={onlineStatusClass}>{getOnlineStatusText(props.player.onlineStatus)}</div>
        {props.player.onlineStatus !== NetworkPlayerStatus.InGame && <div><Button onClick={() => props.onChallengeClick(props.player.name)}>Challenge!</Button></div>
        }    </Card>)
}


export default PlayerProfile