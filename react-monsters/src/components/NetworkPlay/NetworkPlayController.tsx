import RemoteBattle from "components/NetworkPlay/RemoteBattle";
import React, { useRef, useState } from "react"
import { Socket } from "socket.io-client";
import ConnectToServer from "./ConnectToServerScreen";
import MainLobby from "./MainLobby";


export interface NetworkInfo {
    socket?: Socket,
    serverAddress: string,
    currentPlayer: string,
    currentInGameId: number,
}

export interface LoggedInUserInfo {
    inGameId: number,
    isInGame: boolean,
    loggedIn: boolean
}


interface Props {
}


const NetworkPlayController = (props: Props) => {
    const [uiState, setUiState] = useState<string>("login-screen");
    const networkInfo = useRef<NetworkInfo>({
        socket: undefined,
        serverAddress: "",
        currentPlayer: "",
        currentInGameId: -1
    });

    const handleLogIn = (username: string, userInfo: LoggedInUserInfo) => {
        networkInfo.current.currentPlayer = username;
        const socket = networkInfo.current.socket;
        if (socket === undefined) {
            console.error("Could not find socket");
            return;
        }
        socket.emit("login", username);
        if (userInfo.isInGame) {
            networkInfo.current.currentInGameId = userInfo.inGameId;
            setUiState("in-game");
        }
        else {
            setUiState("main-lobby");
        }
    }

    const handleGameStart = (gameStartArgs: any) => {
        networkInfo.current.currentInGameId = gameStartArgs.myId;
        setUiState("in-game");
    }

    const render = () => {
        switch (uiState) {
            case "login-screen": {
                return <ConnectToServer networkInfo={networkInfo.current} OnLogIn={handleLogIn} />
            }
            case "main-lobby": {
                return <MainLobby onGameStart={(info) => handleGameStart(info)} networkInfo={networkInfo.current} />
            }
            case "in-game": {
                return <RemoteBattle networkInfo={networkInfo.current} />
            }
            default: {
                return <div> Error, no ui state found for network play! </div>
            }
        }
    }
    return render();

}


export default NetworkPlayController