import express from 'express';
import cors from "cors";
import BattleService, { OnStateChangeArgs } from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import _ from 'lodash';
import { OnNewTurnLogArgs } from '../../react-monsters/src/game/BattleGame';
import http from "http";
import { Server, Socket } from "socket.io";
import bodyParser from 'body-parser';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';


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


const servicesPerRoom: Map<string, BattleService> = new Map<string, BattleService>();


interface CustomSocket extends Socket {
    decoded_token: any //don't know how to remove compiler errors to check this.
    username: string
}

const usernameSocketMap = new Map<string, Socket>();


let loggedInUsers: string[] = [];


function GetLoggedInUsers() {
    return loggedInUsers;
}

//We need to store who is currently challenging who
interface ChallengeRequest {
    players: string[]
}

let challenges: ChallengeRequest[] = [];

function FindChallenge(username: string): ChallengeRequest | undefined {
    return challenges.find(chal => {
        return chal.players.find(play => play === username) !== undefined;
    });
}
function RemoveChallenge(username:string){
    _.remove(challenges, (chal => {
        return chal.players.find((user)=>user===username)!==undefined;
    }));
}

interface GameInfo{
    players:string[],
    service:BattleService
 }

 let games: GameInfo[] = [];

function IsInGame(username: string) {
    return games.find(game=>{
        return game.players.find(player=>player===username)
    })!==undefined
}

function CreateGame(players: string[]) {

    const player1 = new PlayerBuilder()
        .WithName(players[0])
        .WithRandomPokemon(6)
        .Build();

    const player2 = new PlayerBuilder()
        .WithName(players[1])
        .WithRandomPokemon(6)
        .Build();

    let battleService = new BattleService(true);
    battleService.RegisterPlayer(player1);
    battleService.RegisterPlayer(player2);
    battleService.Initialize();

    let gameInfo = {
        players:[...players],
        service:battleService 
    }
    games.push(gameInfo);

    return gameInfo;
    

}

async function FindSocketByUserName(username: string){
    const sockets = await io.sockets.fetchSockets();
    const socket = sockets.find(sock => {
        let customSock = (sock as unknown as CustomSocket);
        return customSock.username === username;
    });
    return socket;
}

io.on("connection", (socket) => {

    let customSocket = (socket as CustomSocket);

    socket.on("login", (username) => {
        customSocket.username = username;
        console.log(`${customSocket.username} has logged in!`);

        //TODO - redirect to game if user is logged in.
    });

    socket.on("disconnecting", () => {
        console.log(customSocket.username + " has disconnected");
        _.remove(loggedInUsers, (user) => user === customSocket.username);
        RemoveChallenge(customSocket.username);

        console.log("Challenge Length",challenges.length);
        io.sockets.emit("users-changed", loggedInUsers);
    });

    socket.on("challenge-request", async (challengeOptions) => {
        console.log(challengeOptions.player1);
        console.log(challengeOptions.player2);

        const {player1,player2} = challengeOptions;

        if (FindChallenge(player1) !== undefined || IsInGame(player1)){
            //should not be able to issue more than 1 challenge
            return;
        }
        //Get socket id of player2.
        const sockets = await io.sockets.fetchSockets();
        const challengeRequest: ChallengeRequest = {
            players: []
        }
        const player1Socket = await FindSocketByUserName(player1);
        if (player1Socket === undefined) {
            console.error("Could not find socket for challenge request", player1);
            return;
        }

        const player2Socket = await FindSocketByUserName(player2);

        if (player2Socket === undefined) {
            console.error("Could not find socket for challenge request", player2);
            return;
        }

        if (FindChallenge(player2) !== undefined || IsInGame(player2)) {
            player1Socket.emit("challenge-request-error", { message: `${challengeOptions.player2} cannot be challenged at the moment!` })
            return;
        }

        //this should be removed once the challenge is accepted.
        challenges.push({
            players: [challengeOptions.player1, challengeOptions.player2]
        });

        player1Socket.emit("challenge-request-sent", challengeOptions);
        player2Socket.emit("challenge-request-received", challengeOptions);
    });

    socket.on("challenge-request-accept", async (options) => {
        //challenge has been accepted, remove the challenge and put them both into a game.
        const challenge = FindChallenge(customSocket.username);

        if (challenge === undefined){
            console.error(`Could not find challenge :(`);
            return;
        }

        const player1Socket = await FindSocketByUserName(challenge.players[0]);
        const player2Socket = await FindSocketByUserName(challenge.players[1]);

        player1Socket?.emit("challenge-ready");
        player2Socket?.emit("challenge-ready");

        console.log("challenge accepted");
        //emit a message to both players
        RemoveChallenge(customSocket.username);
        const gameInfo = CreateGame(challenge.players); 
        const battleService = gameInfo.service;
        player1Socket?.emit("match-begin",{
            players:gameInfo.players,
            myId:gameInfo.service.GetPlayers()[0].id,
            myName:gameInfo.service.GetPlayers()[0].name
        })
        player2Socket?.emit("match-begin",{
            players:gameInfo.players,
            myId:gameInfo.service.GetPlayers()[1].id,
            myName:gameInfo.service.GetPlayers()[1].name
        });
        
        socket.on("action", (action) => {
            console.log("action recieved", action);
            battleService?.SetPlayerAction(action);
        });

        battleService.OnNewTurnLog.on((args: OnNewTurnLogArgs) => {
            console.log("emitting new turn log", args.currentTurnLog.length);
            player1Socket?.emit("newturnlog", args);
            player2Socket?.emit("newTurnLog",args)
        });

        battleService.OnGameOver.on((args) => {
            player1Socket?.emit("gameover",args);
            player2Socket?.emit("gameover",args);
        });

        //we can't start the game right away... we need to 
        //wait until the remote battle services have send messages to here
        socket.on("connected-to-game",()=>{
        
        });
        battleService!.Start();
        socket.on("testgame",()=>{
            player1Socket?.emit("gamestart", { field: battleService.GetField() });
            player2Socket?.emit("gamestart", { field: battleService.GetField() });

        }); 
        //This needs to fire first, then the client side socket will send the game start ready.
       // player1Socket?.emit("gamestart", { field: battleService.GetField() });
      //  player2Socket?.emit("gamestart", { field: battleService.GetField() });
        
        //todo: put into game.
    });

  

    socket.on("challenge-request-decline",async ()=>{
        const challenge = FindChallenge(customSocket.username);
        if (challenge === undefined){
            console.error(`Could not find challenge :(`);
            return;
        }
        const player1Socket = await FindSocketByUserName(challenge.players[0]);
        const player2Socket = await FindSocketByUserName(challenge.players[1]);

        player1Socket?.emit("challenge-request-declined");
        RemoveChallenge(customSocket.username);
    });

    //Below here shouldn't matter anymore.
    socket.on("not in use", () => {
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


app.get("/getOnlineUsers", async (req, res) => {
    return res.json({ users: loggedInUsers })
});


app.post('/login', async (req, res) => {
    console.log("login request recieved");
    console.log(req.body);
    //fail
    if (loggedInUsers.find(user => user === req.body.name) !== undefined) {
        return res.status(401).send({
            message: 'Connection Failed - Username already connected!'
        });
    }
    else { //success
        loggedInUsers.push(req.body.name)
        io.sockets.emit("users-changed", loggedInUsers);
        return res.json({ status: "success", username: req.body.name });
    }
});
 
app.get("/getvalidactions",async(req,res)=>{
    const username = req.params.username;
    const gameInfo = games.find(info=>info.players.find(name=>name==username)!==undefined);
    const playerInGame= gameInfo?.service.GetPlayers().find(player=>player.name === username);

    if (playerInGame === undefined){
        return;
    }

    const validActions = await gameInfo?.service.GetValidActions(playerInGame.id);
    return res.json(validActions);
}); 



/* -> Marked For Deletion.
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
*/


server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

