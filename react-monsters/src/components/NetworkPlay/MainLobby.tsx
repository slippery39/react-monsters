import { Card, message, Modal } from "antd"
import React, { useEffect, useState } from "react"
import { NetworkInfo } from "./NetworkPlayController";
import NetworkPlayerInfo from "./NetworkPlayer";
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
        console.log(player);
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
                console.log(info);
                props.onGameStart(info);
            });     

            let challengeRecievedModal:any | undefined = undefined;

            const handleAccept = ()=>{
                console.log("trying to handle accept");
                props.networkInfo.socket!.emit("challenge-request-accept");
                console.log("player request recieved");
                challengeRecievedModal?.destroy();
            }

            const handleDecline = ()=>{
                props.networkInfo.socket!.emit("challenge-request-decline");
                console.log("player request declined");
                challengeRecievedModal?.destroy();
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
               
                waitingForResponseModal = Modal.info({
                    content: `Waiting for ${options.player2} to respond`,
                    title: `Battle Request`,    
                    cancelButtonProps:{disabled:true,style:{display:'none'}},
                    okButtonProps:{disabled:true,style:{display:'none'}}                 
                    });   
            });

            props.networkInfo.socket!.on("challenge-ready",()=>{
                waitingForResponseModal?.destroy();
                message.info(`Challenge has been accepted`);  
                                      
            });

            props.networkInfo.socket!.on("challenge-request-declined",()=>{
                waitingForResponseModal?.destroy();
                message.warn("Challenge has been declined");
            });
            //eslint-disable-next-line
        }, []);

        const createPlayerInfo = (player: NetworkPlayerInfo): NetworkPlayerInfo => {
            return {
                name: player.name,
                onlineStatus: player.onlineStatus
            }
        }

        console.log(onlinePlayers);
        const otherPlayerList = onlinePlayers
        .filter(player => player.name !== props.networkInfo.currentPlayer)
        .map(player => <PlayerProfile onChallengeClick={onChallengeClick} player={createPlayerInfo(player)}></PlayerProfile>)




    return (<Card>
        <div>Main Lobby</div>
        <div>Players online: {onlinePlayers.length}</div>
        {otherPlayerList.length === 0 ? <div>No other players are online!</div> : otherPlayerList}
    </Card>)
}


export default MainLobby