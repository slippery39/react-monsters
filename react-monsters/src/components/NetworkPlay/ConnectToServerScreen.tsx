import { Button, Card, Form, Input, message } from "antd"
import { Socket } from "net"
import React from "react"
import { io } from "socket.io-client";

interface Props {
    OnLogIn: (name:string)=>void
}


const onFinish = async (ip: string, name: string) => {    

var loggedIn = false;

try{
    const response = await fetch(ip + "/login", {
        method: 'POST',
        body: JSON.stringify({ name: name }),
        headers: { 'content-type': 'application/json;charset=UTF-8', }
    });

    const json = await response.json();

    if (json.status === "success"){
        //log in
        message.success("Login sucessful!");
        var socket = io(ip);
        loggedIn = true;
        socket.emit("login",name);

    }
    else{
        message.error(json.message);
    }
}
catch(error){
    message.error("Login Failed, please check the server address");
}

return loggedIn;
    
    
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

    return (<Card>
        <Form
            form={form}
            {...layout}
            name="connectToServer"
            onFinish={
                async ()=>{                
                let loggedIn= await onFinish(form.getFieldValue("ipaddress"),form.getFieldValue("username"));
                if (loggedIn){
                    props.OnLogIn(form.getFieldValue("username"));
                }                
                message.info(loggedIn);                
            }}
            onFinishFailed={onFinishFailed}
            requiredMark={false}
            initialValues={{ ipaddress: "http://localhost:8000" }}>
            <Form.Item label="Username" name="username" rules={[{ required: true, message: "Input their username" }]}><Input placeholder="Pick a username"></Input></Form.Item>
            <Form.Item label="IP Address" name="ipaddress" rules={[{ required: true, message: "Please input the server address" }]}><Input placeholder="Enter the server address"></Input></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit" >Connect</Button></Form.Item>
        </Form>
    </Card>)
}


export default ConnectToServer