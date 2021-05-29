import RemoteBattle from "components/Battle/RemoteBattle/RemoteBattle";
import React, { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client";
import ConnectToServer from "./ConnectToServerScreen";
import MainLobby from "./MainLobby";


export interface NetworkInfo{
    socket?:Socket,
    serverAddress:string,
    currentPlayer:string,
    currentInGameId:number,
}



interface Props{
}




const NetworkPlayController= (props: Props) => {
    const [uiState,setUiState] = useState<string>("login-screen");
    const networkInfo = useRef<NetworkInfo>({
        socket:undefined,
        serverAddress:"",
        currentPlayer:"",
        currentInGameId:-1
    });   

    const handleLogIn = (username:string)=>{
        networkInfo.current.currentPlayer = username;
        setUiState("main-lobby");
    }

    const handleGameStart = (gameStartArgs:any)=>{
        networkInfo.current.currentInGameId = gameStartArgs.myId;
        setUiState("in-game");
    }

    const render = ()=>{
        switch(uiState){
            case "login-screen":{
                return <ConnectToServer networkInfo={networkInfo.current} OnLogIn = {handleLogIn}/>
            }
            case "main-lobby":{
                return <MainLobby onGameStart={(info)=>handleGameStart(info)} networkInfo={networkInfo.current}/>
            }
            case "in-game":{
                return <RemoteBattle networkInfo={networkInfo.current}/>
            }
            default:{
                return <div> Error, no ui state found for network play! </div>
            }
        }
    }
    return render();
    
}


export default NetworkPlayController