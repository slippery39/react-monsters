import React, { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client";
import ConnectToServer from "./ConnectToServerScreen";
import MainLobby from "./MainLobby";


export interface NetworkInfo{
    socket?:Socket,
    serverAddress:string,
    currentPlayer:string
}

interface Props{
}




const NetworkPlayController= (props: Props) => {
    const [uiState,setUiState] = useState<string>("login-screen");
    const networkInfo = useRef<NetworkInfo>({
        socket:undefined,
        serverAddress:"",
        currentPlayer:""
    });   

    const handleLogIn = (username:string)=>{
        networkInfo.current.currentPlayer = username;
        setUiState("main-lobby");
    }

    const render = ()=>{
        switch(uiState){
            case "login-screen":{
                return <ConnectToServer networkInfo={networkInfo.current} OnLogIn = {handleLogIn}/>
            }
            case "main-lobby":{
                return <MainLobby networkInfo={networkInfo.current}/>
            }
            default:{
                return <div> Error, no ui state found for network play! </div>
            }
        }
    }
    return render();
    
}


export default NetworkPlayController