import { Button, Card, Form, Input, message } from "antd"
import { Socket } from "net"
import React, { useState } from "react"
import { io } from "socket.io-client";
import { NetworkInfo } from "./NetworkPlayController";

interface Props {
    OnLogIn: (name:string)=>void
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

        var loggedIn = false;
        
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
                props.networkInfo.serverAddress = serverAddress                
                socket.emit("login",name);
                loggedIn = true;
            }
            else{
                message.error(json.message);
            }
        
        }
        catch(error){
            message.error("Could not connect to server, check the address and try again");
        }
        
        setIsFetching(false);
        return loggedIn;
            
            
        }

    return (<Card>
        <Form
            form={form}
            {...layout}
            name="connectToServer"
            onFinish={
                async ()=>{                
                let loggedIn= await onSubmitForm(form.getFieldValue("ipaddress"),form.getFieldValue("username"));
                if (loggedIn){
                    props.OnLogIn(form.getFieldValue("username"));
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