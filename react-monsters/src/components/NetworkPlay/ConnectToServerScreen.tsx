import { Button, Card, Form, Input, message } from "antd"
import { Socket } from "net"
import React, { useState } from "react"
import { io } from "socket.io-client";
import { LoggedInUserInfo, NetworkInfo } from "./NetworkPlayController";

interface Props {
    OnLogIn: (name:string,userInfo:LoggedInUserInfo)=>void
    networkInfo:NetworkInfo
}



const onFinishFailed = () => {
    console.log('finish has failed');
}

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const ConnectToServer = (props: Props) => {
    const [form] = Form.useForm();
    const [isFetching,setIsFetching] = useState<boolean>(false);

    const onSubmitForm = async (serverAddress: string, name: string) => {  
        
        setIsFetching(true);

        var connectInfo: LoggedInUserInfo = {
            inGameId:-1,
            isInGame:false,
            loggedIn:false
        }
        
        try{
            const response = await fetch(serverAddress + "/login", {
                method: 'POST',
                body: JSON.stringify({ name: name }),
                headers: { 'content-type': 'application/json;charset=UTF-8', }
            });
        
            const json = await response.json();
        
            if (json.status === "success"){                  
                message.success("Login sucessful!");
                var socket = io(serverAddress);
                props.networkInfo.socket = socket;
                props.networkInfo.serverAddress = serverAddress;
                props.networkInfo.currentInGameId = json.inGameId;

                connectInfo.inGameId = json.userInfo.inGameId;
                connectInfo.isInGame = json.userInfo.isInGame;
                connectInfo.loggedIn = true;
            }
            else{
                message.error(json.message);
            }
        
        }
        catch(error){
            message.error("Could not connect to server, check the address and try again");
        }
        
        setIsFetching(false);

     
        return connectInfo;
            
            
        }

    return (<Card>
        <Form
            form={form}
            {...layout}
            name="connectToServer"
            onFinish={
                async ()=>{                
                let result= await onSubmitForm(form.getFieldValue("ipaddress"),form.getFieldValue("username"));
                if (result.loggedIn){
                    props.OnLogIn(form.getFieldValue("username"),result);
                }              
              
            }}
            onFinishFailed={onFinishFailed}
            requiredMark={false}
            initialValues={{ ipaddress: "http://localhost:8000" }}>
            <Form.Item label="Username" name="username" rules={[{ required: true, message: "Input their username" }]}><Input placeholder="Pick a username"></Input></Form.Item>
            <Form.Item label="Server Address" name="ipaddress" rules={[{ required: true, message: "Please input the server address" }]}><Input placeholder="Enter the server address"></Input></Form.Item>
            <Form.Item><Button type="primary" disabled={isFetching} htmlType="submit" >Connect</Button></Form.Item>
        </Form>
    </Card>)
}


export default ConnectToServer