import { Card, message, Modal } from "antd"
import React, { useEffect, useState } from "react"
import { NetworkInfo } from "./NetworkPlayController";
import NetworkPlayerInfo from "../../game/NetworkPlay/NetworkPlayer";
import PlayerProfile from "./PlayerProfile";

interface Props {
    networkInfo: NetworkInfo,
    onGameStart:(info:any)=>void;
}

const MainLobby = (props: Props) => {
    const [onlinePlayers, setOnlinePlayers] = useState<NetworkPlayerInfo[]>([]);

    const handleUsersChanged = (players: NetworkPlayerInfo[]) => {
        //TODO - 
        setOnlinePlayers(players);
    }

    const onChallengeClick = ((player: string) => {
        //TODO: do not handle is user clicked is the connected user.
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

            if (props.networkInfo.socket === undefined){
                throw new Error(`socket was undefined`);
            }

            props.networkInfo.socket.on("users-changed", handleUsersChanged);

            return () => {
                props.networkInfo.socket?.off("users-changed", handleUsersChanged);
            }

        }, [props.networkInfo.serverAddress,props.networkInfo.socket]);

        useEffect(() => {

            if (props.networkInfo.socket === undefined){
                console.error(`something went wrong, socket is undefined`);
                throw new Error(`something went wrong, socket is undefined`);
            }
     


            props.networkInfo.socket.on("match-begin",(info)=>{
                message.info("Match is beginning");
                props.onGameStart(info);
            });     

            let challengeRecievedModal:any | undefined = undefined;

            const handleAccept = ()=>{
                props.networkInfo.socket!.emit("challenge-request-accept");
                challengeRecievedModal?.destroy();
            }

            const handleDecline = ()=>{
                props.networkInfo.socket!.emit("challenge-request-decline");
                    challengeRecievedModal?.destroy();
            }

            const handleCancel = ()=>{
                props.networkInfo.socket!.emit("challenge-cancel")
                waitingForResponseModal?.destroy();
            }

            props.networkInfo.socket!.on("challenge-request-received", (options: { player1: string, player2: string }) => {
   
                challengeRecievedModal = Modal.confirm({
                    content: `${options.player1} has challenged you to a battle`,
                    title: `Battle Request`,
                    okText: 'Accept',
                    onOk:()=>handleAccept(),
                    cancelText: 'Decline',
                    onCancel:()=>handleDecline()
                }
                );                
               
                //close if the challenge is void        
                // message.info(`${options.player1} has challenged you to a battle!`)
            });


            let waitingForResponseModal:any |undefined;
            props.networkInfo.socket!.on("challenge-request-sent", (options: { player1: string, player2: string })=>{
               
                waitingForResponseModal = Modal.confirm({
                    content: `Waiting for ${options.player2} to respond`,
                    title: `Battle Request`,  
                    onCancel:()=>handleCancel(),  
                    okButtonProps:{disabled:true,style:{display:'none'}}                 
                    });   
            });

            props.networkInfo.socket!.on("challenge-ready",()=>{
                waitingForResponseModal?.destroy();
                message.info(`Challenge has been accepted`);                                        
            });

            props.networkInfo.socket!.on("challenge-request-declined",(serverMessage)=>{
                waitingForResponseModal?.destroy();
                challengeRecievedModal?.destroy(); //in case the issuing player cancels the challenge.
                message.warn(serverMessage);
            });

            props.networkInfo.socket!.on("challenge-request-error",(serverMessage)=>{
                waitingForResponseModal?.destroy();
                message.warn(serverMessage);
            });


            return function(){
                props.networkInfo.socket?.off("challenge-request-error");
                props.networkInfo.socket?.off("challenge-request-declined");
                props.networkInfo.socket?.off("challenge-ready");
                props.networkInfo.socket?.off("challenge-request-sent");
                props.networkInfo.socket?.off("challenge-request-received");
                props.networkInfo.socket?.off("match-begin");
            }
            //eslint-disable-next-line
        }, [props.networkInfo.socket]);

        const createPlayerInfo = (player: NetworkPlayerInfo): NetworkPlayerInfo => {
            return {
                name: player.name,
                onlineStatus: player.onlineStatus
            }
        }

        const otherPlayerList = onlinePlayers
        .filter(player => player.name !== props.networkInfo.currentPlayer)
        .map(player => <PlayerProfile onChallengeClick={onChallengeClick} player={createPlayerInfo(player)}></PlayerProfile>)

    return (<Card>
        <div><h1>Main Lobby</h1></div>
        <div><h3>Welcome {props.networkInfo.currentPlayer}!</h3></div>
        <div>Players online: {onlinePlayers.length}</div>
        {otherPlayerList.length === 0 ? <div>No other players are online!</div> : otherPlayerList}
    </Card>)
}


export default MainLobby