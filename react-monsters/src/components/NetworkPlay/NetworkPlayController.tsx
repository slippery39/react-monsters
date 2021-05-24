import React, { useState } from "react"
import ConnectToServer from "./ConnectToServerScreen";


interface Props{

}

const NetworkPlayController= (props: Props) => {
    const [uiState,setUiState] = useState<string>("login-screen");


    const handleLogIn = (username:string)=>{
        setUiState("main-lobby");
    }

    const render = ()=>{
        switch(uiState){
            case "login-screen":{
                return <ConnectToServer OnLogIn = {handleLogIn}/>
            }
            case "main-lobby":{
                return <div>You are in the main lobby!</div>
            }
            default:{
                return <div> Error, no ui state found for network play! </div>
            }
        }
    }
    return render();
    
}


export default NetworkPlayController