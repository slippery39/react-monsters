import { UserSwitchOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd"

import React, { useEffect, useState } from "react"
import { NetworkInfo } from "./NetworkPlayController";

interface Props {
    networkInfo:NetworkInfo
}


const MainLobby = (props: Props) => {
    const [form] = Form.useForm();
    const[onlineUsers,setOnlineUsers] = useState<string[]>([]);


    const handleUsersChanged = (users:string[])=>{
        setOnlineUsers(users);
    }

    const handleUserClick = ( (user:string)=>{
        //TODO: do not handle is user clicked is the connected user.
        console.log(user);
        props.networkInfo.socket!.emit("challenge-request",{
            player1:props.networkInfo.currentUser,
            player2:user
        })
    })

    useEffect(() => {
        (async () => {
            const response = await fetch(props.networkInfo.serverAddress+"/getOnlineUsers", {
                method: 'GET',
                headers: { 'content-type': 'application/json;charset=UTF-8', }
            });
            const resJSON = await response.json();

            setOnlineUsers(resJSON.users);
        }
        )();

        props.networkInfo.socket!.on("users-changed",handleUsersChanged);

        return ()=>{
            props.networkInfo.socket!.off("users-changed",handleUsersChanged);
        }

    }, []);

    useEffect(()=>{
        props.networkInfo.socket!.on("challenge-request-received",(options)=>{
            message.info(`${options.player1} has challenged you to a battle!`)
        });
    },[]);

    const renderUsers = ()=>{
        return onlineUsers.map(user=><div key={user}><button onClick={()=>handleUserClick(user)} key={user}>{user}</button></div>)
    }

    return (<Card>
        Main Lobby<br/>
        {renderUsers()}
    </Card>)
}


export default MainLobby