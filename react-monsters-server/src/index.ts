import express from 'express';
import cors from "cors";
import BattleService, { OnStateChangeArgs } from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import _ from 'lodash';
import { OnNewTurnLogArgs } from '../../react-monsters/src/game/BattleGame';
import http from "http";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import bodyParser from 'body-parser';

export interface MatchResult {
    winningPokemon: string[],
    losingPokemon: string[],
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => res.send(`Pokemon Battle Simulator Server`));
app.get("/test", (req, res) => {
    console.log("test recieved!");
    return res.send("Hello world!");
});

var roomID = 1;
const NextRoom = () => {
    return "Room - " + roomID++;
}


const servicesPerRoom: Map<string, BattleService> = new Map<string, BattleService>();


interface CustomSocket extends Socket{
    username:string
}

let loggedInUsers: string[] = [];

//users in battle. -> keep track of these eventually. users who disconnect should be 
//reconnected inside their battle.


io.on("connection", (socket) => {

    socket.on("login",(username)=>{
        var customSocket = (socket as CustomSocket);
        customSocket.username = username;
        console.log(`${customSocket.username} has logged in!`);
    });

    socket.on("disconnect",()=>{     
        var customSocket = (socket as CustomSocket);
       console.log(`removing ${customSocket.username}`);
       _.remove(loggedInUsers,(user)=>user===customSocket.username);
       console.log(loggedInUsers);
        //get the name of the socket
    });


    //Below here shouldn't matter anymore.
    socket.on("testgame", () => {
        console.log("test game has been started");

        const room = "Room - 1";
        socket.join("Room - 1");

        //Nobody is in the room yet.
        if (servicesPerRoom.get("Room - 1") === undefined) {

            console.log("a user connected to room " + room);
            //initialize a game.


            const player1 = new PlayerBuilder()
                .WithName("Shayne")
                .WithRandomPokemon(6)
                .Build();

            const ai1 = new PlayerBuilder()
                .WithName("AI John")
                .WithRandomPokemon(6)
                .Build();

            let battleService = new BattleService(true);

            battleService.RegisterPlayer(player1);
            battleService.RegisterPlayer(ai1);
            servicesPerRoom.set("Room - 1", battleService);


            socket.on("action", (action) => {
                console.log("action recieved", action);
                battleService?.SetPlayerAction(action);
            });


            //new BasicAI(player1, battleService,{chooseDelayMS:4000});

            //new BasicAI(ai1, battleService,{chooseDelayMS:1000});

            battleService.OnNewTurnLog.on((args: OnNewTurnLogArgs) => {
                console.log("emitting new turn log", args.currentTurnLog.length);
                io.to(room).emit("newturnlog", args);
            });

            battleService.OnGameOver.on((args) => {
                io.to(room).emit("gameover", args);
            });

            socket.on("gamestartready", (data) => {
                console.log("gamestartready recieved")
                battleService!.Start();
            });

            battleService.Initialize();

            //this is the problem right here.

            console.log(battleService.GetField());
            io.to(room).emit("gamestart", { field: battleService.GetField() });
            console.log("game starting");
        }
        else {
            let battleService = servicesPerRoom.get("Room - 1");
            //TODO - this should be a better name??

            if (battleService === undefined) {
                console.error('something is wrong, we could not find the battle service... exiting');
                return;
            }

            const updateStateArgs: OnStateChangeArgs = {
                newField: battleService?.GetField(),
                currentTurnState: battleService.GetBattle().currentState,
                actionsNeededIds: battleService.GetBattle().GetPlayerIdsThatNeedActions()
            }
            io.to(room).emit("update-state", updateStateArgs);
            //Try setting an action here.
            socket.on("action", async (action, fn) => {
                console.log("action recieved", action);
                const success = await battleService?.SetPlayerAction(action);
                console.log("success? ", success);
                fn({ success: success });
            });
        }
    });
})



app.post('/login',async(req,res)=>{    
    console.log("login request recieved");
    console.log(req.body);
    //if username is not currently connected, then log in.
    if (loggedInUsers.find(user=>user===req.body.name)!==undefined){
        return res.json({status:"not successful",username:req.body.name,message:"Connection Failed - Username already connected!"});
    }
    else{
        loggedInUsers.push(req.body.name)
        return res.json({status:"success",username:req.body.name});
    }
});


app.get("/getvalidactions1", async (req, res) => {
    //hard coded room and player id for now.


    const service = servicesPerRoom.get("Room - 1");
    const validActions = await service?.GetValidActions(1);
    console.log("get valid actions 1 has been called!");
    console.log(JSON.stringify(validActions));
    return res.json(validActions);
});


app.get("/getvalidactions2", async (req, res) => {

    const service = servicesPerRoom.get("Room - 1");
    const validActions = await service?.GetValidActions(2);
    console.log("get valid actions 1 has been called!");
    console.log(JSON.stringify(validActions));
    return res.json(validActions);
});


server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

