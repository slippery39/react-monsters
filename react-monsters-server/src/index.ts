import express from 'express';
import cors from "cors";
import BattleService, { OnStateChangeArgs } from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import _ from 'lodash';
import { OnNewTurnLogArgs } from 'game/BattleGame';
import http from "http";
import { Server, Socket } from "socket.io";
import bodyParser from 'body-parser';
import { NetworkPlayerInfo, NetworkPlayerStatus } from "game/NetworkPlay/NetworkPlayer";
import { GetAllPokemonInfo } from 'game/Pokemon/PremadePokemon';



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => res.send(`Pokemon Battle Simulator Server`));
app.get("/test", (req, res) => {
    return res.send("Hello world!");
});


interface CustomSocket extends Socket {
    username: string
}



//We need to store who is currently challenging who
interface ChallengeRequest {
    players: string[],
    teams:Array<string[]>
}

let challenges: ChallengeRequest[] = [];

function FindChallenge(username: string): ChallengeRequest | undefined {
    return challenges.find(chal => {
        return chal.players.find(play => play === username) !== undefined;
    });
}
function RemoveChallenge(username: string) {
    _.remove(challenges, (chal => {
        return chal.players.find((user) => user === username) !== undefined;
    }));
}

async function DeclineChallenge(username: string, message?: string) {
    const challenge = FindChallenge(username);
    if (challenge === undefined) {
        console.error(`Could not find challenge :(`);
        return;
    }
    const otherPlayer = challenge.players.find(p => p !== username);

    if (otherPlayer === undefined) {
        console.error("Could not find other player for challenge :(");
        return;
    }
    const otherPlayerSocket = await FindSocketByUserName(otherPlayer);

    if (message === undefined) {
        message = "Challenge has been declined"
    }

    otherPlayerSocket?.emit("challenge-request-declined", message);
}



interface GameInfo {
    players: string[],
    service: BattleService
}

let loggedInUsers: NetworkPlayerInfo[] = [];

function FindLoggedInUser(username: string) {
    return loggedInUsers.find(user => user.name === username);
}

let games: GameInfo[] = [];

function RemoveGameByUserName(username: string) {
    _.remove(games, (gameInfo => {
        gameInfo.players.includes(username);
    }));
}

function IsInGame(username: string) {
    return games.find(game => {
        return game.players.find(player => player === username)
    }) !== undefined
}

function GetGameInfoForPlayer(username: string) {
    return games.find(game => {
        return game.players.find(player => player === username)
    });
}

function CreateGame(challengeInfo:ChallengeRequest) {


    const {players,teams} = challengeInfo;

    console.log(teams);

    if (teams.length!==players.length){
        console.error("ERROR: Invalid Game Settings");
    }


    let player1Builder = new PlayerBuilder().WithName(players[0]);
    if (teams[0].length === 0){
            player1Builder
            .WithRandomPokemon(6)
    }
    else{
        teams[0].forEach(name=>player1Builder.WithPokemon(name));
    }

    let player2Builder= new PlayerBuilder()
        .WithName(players[1])
    if (teams[1].length === 0){
        player2Builder.WithRandomPokemon(6);
    }
    else{
        teams[1].forEach(name=>player2Builder.WithPokemon(name));
    }


    let battleService = new BattleService(true);
    battleService.RegisterPlayer(player1Builder.Build());
    battleService.RegisterPlayer(player2Builder.Build());
    battleService.Initialize();

    let gameInfo = {
        players: [...players],
        service: battleService
    }
    games.push(gameInfo);

    return gameInfo;
}

function NotifyPlayerStatusChange() {
    io.sockets.emit("users-changed", loggedInUsers);
}

async function FindSocketByUserName(username: string) {
    const sockets = await io.sockets.fetchSockets();
    const socket = sockets.find(sock => {
        let customSock = (sock as unknown as CustomSocket);
        return customSock.username === username;
    });
    return socket;
}

const LogOff = (customSocket: CustomSocket) => {
    console.log(customSocket.username + " has disconnected");
    _.remove(loggedInUsers, (user) => user.name === customSocket.username);
    DeclineChallenge(customSocket.username, "Challenge has been cancelled - other player has disconnected");
    RemoveChallenge(customSocket.username);
    NotifyPlayerStatusChange();
}

io.on("connection", (socket) => {

    let customSocket = (socket as CustomSocket);

    socket.on("login", (username) => {
        customSocket.username = username;
        console.log(`${customSocket.username} has logged in!`);
    });

    socket.on("disconnecting", () => {
        LogOff(customSocket);
    });

    socket.on("logoff", () => {
        LogOff(customSocket);
    });

    socket.on("challenge-request", async (challengeOptions) => {
        const { player1, player2, player1Team } = challengeOptions;

        if (FindChallenge(player1) !== undefined || IsInGame(player1)) {
            //should not be able to issue more than 1 challenge
            return;
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
        if (FindChallenge(player1) !== undefined || IsInGame(player1)) {
            player1Socket.emit("challenge-request-error", `You can only challenge one player at a time`);
            return;
        }

        if (FindChallenge(player2) !== undefined || IsInGame(player2)) {

            player1Socket.emit("challenge-request-error", `${challengeOptions.player2} cannot be challenged at the moment!`)
            return;
        }

        //this should be removed once the challenge is accepted.
        challenges.push({
            players: [challengeOptions.player1, challengeOptions.player2],
            teams:[player1Team]
        });

        player1Socket.emit("challenge-request-sent", challengeOptions);
        player2Socket.emit("challenge-request-received", challengeOptions);
    });

    socket.on("action", async (action, fn) => {
        const gameInfo = GetGameInfoForPlayer(customSocket.username);
        if (gameInfo === undefined) {
            fn({ success: false });
            return;
        }
        const success = await gameInfo.service?.SetPlayerAction(action);
        fn({ success: success });
    });

    socket.on("get-game-state", () => {

        const gameInfo = GetGameInfoForPlayer(customSocket.username);
        const battleService = gameInfo?.service;
        if (battleService === undefined) {
            console.error('something is wrong, we could not find the battle service... exiting');
            return;
        }

        const updateStateArgs: OnStateChangeArgs = {
            newField: battleService?.GetField(),
            currentTurnState: battleService.GetBattle().currentState,
            actionsNeededIds: battleService.GetBattle().GetPlayerIdsThatNeedActions()
        }
        socket.emit("join-game", updateStateArgs);
    });

    //If the issuing player cancels the challenge.
    socket.on("challenge-cancel", async () => {
        const challenge = FindChallenge(customSocket.username);
        if (challenge === undefined) {
            console.error(`Could not find challenge :(`);
            return;
        }
        const player2Socket = await FindSocketByUserName(challenge.players[1]);
        player2Socket?.emit("challenge-request-declined", `${customSocket.username} cancelled the challenge`);
        RemoveChallenge(customSocket.username);
    })


    socket.on("challenge-request-accept", async (options:{player2Team:string[]}) => {

       

        //challenge has been accepted, remove the challenge and put them both into a game.
        const challenge = FindChallenge(customSocket.username);

        

        if (challenge === undefined) {
            console.error(`Could not find challenge :(`);
            return;
        }

        challenge.teams.push(options.player2Team)

        const player1Socket = await FindSocketByUserName(challenge.players[0]);
        const player2Socket = await FindSocketByUserName(challenge.players[1]);

        player1Socket?.emit("challenge-ready");
        player2Socket?.emit("challenge-ready");

        //emit a message to both players
        RemoveChallenge(customSocket.username);
        const gameInfo = CreateGame(challenge);
        const battleService = gameInfo.service;
        player1Socket?.emit("match-begin", {
            players: gameInfo.players,
            myId: gameInfo.service.GetPlayers()[0].id,
            myName: gameInfo.service.GetPlayers()[0].name
        })
        player2Socket?.emit("match-begin", {
            players: gameInfo.players,
            myId: gameInfo.service.GetPlayers()[1].id,
            myName: gameInfo.service.GetPlayers()[1].name
        });

        let userInfo1 = loggedInUsers.find(p => p.name === challenge.players[0]);
        if (userInfo1 !== undefined) {
            userInfo1.onlineStatus = NetworkPlayerStatus.InGame;
        }

        let userInfo2 = loggedInUsers.find(p => p.name === challenge.players[1]);
        if (userInfo2 !== undefined) {
            userInfo2.onlineStatus = NetworkPlayerStatus.InGame;
        }


        battleService.OnNewTurnLog.on(async (args: OnNewTurnLogArgs) => {
            //We need to find these again, since if the user disconnects and reconnects,
            //then their socket will be different. 
            const player1Socket = await FindSocketByUserName(challenge.players[0]);
            const player2Socket = await FindSocketByUserName(challenge.players[1]);
            player1Socket?.emit("newturnlog", args);
            player2Socket?.emit("newturnlog", args)
        });

        battleService.OnGameOver.on(async (args) => {
            const player1Socket = await FindSocketByUserName(challenge.players[0]);
            const player2Socket = await FindSocketByUserName(challenge.players[1]);

            //remove the game..
            RemoveGameByUserName(challenge.players[0]);


            player1Socket?.emit("gameover", args);
            player2Socket?.emit("gameover", args);
        });
        socket.on("game-ready", () => {
            player1Socket?.emit("gamestart", { field: battleService.GetField() });
            player2Socket?.emit("gamestart", { field: battleService.GetField() });
            battleService!.Start();
            NotifyPlayerStatusChange();
        });
    });

    socket.on("leave-game", async () => {
        const player = FindLoggedInUser(customSocket.username);
        if (player === undefined) {
            return;
        }
        player.onlineStatus = NetworkPlayerStatus.Online;
        NotifyPlayerStatusChange();
    });


    socket.on("challenge-request-decline", async () => {
        const challenge = FindChallenge(customSocket.username);
        if (challenge === undefined) {
            console.error(`Could not find challenge :(`);
            return;
        }
        const player1Socket = await FindSocketByUserName(challenge.players[0]);
        player1Socket?.emit("challenge-request-declined");
        RemoveChallenge(customSocket.username);
    });
})


//TODO - change our front end code.
app.get("/getOnlineUsers", async (req, res) => {
    return res.json({ users: loggedInUsers })
});


function ValidateUserName(username: string): string {
    if (username.length > 10) {
        return "Your username has to be 10 characters or less";
    }
    if (!username.match("^[A-Za-z]+$")) {
        return "Your username must only contain letters";
    }
    return "success"
}

let playerTeams = new Map<string,string[]>();

function SetRandomPlayerTeam(username:string){
    if (playerTeams.get(username)!==undefined){
        let randomTeam = _.shuffle(GetAllPokemonInfo());
        randomTeam = _.take(randomTeam,6);
        playerTeams.set(username, randomTeam.map(obj=>obj.species));
    }    
}

app.post('/login', async (req, res) => {
    var username = req.body.name as unknown as string;
    //fail

    if (ValidateUserName(username) !== "success") {
        return res.status(401).send({
            message: ValidateUserName(username)
        });
    }
    if (loggedInUsers.find(user => user.name === username) !== undefined) {
        return res.status(401).send({
            message: 'Connection Failed - Username already connected!'
        });
    }
    else { //success

        let user: NetworkPlayerInfo = {
            name: username,
            onlineStatus: NetworkPlayerStatus.Online
        }

        //TODO : grab the game information as well        
        const game = GetGameInfoForPlayer(username);
        let userInfo: {
            isInGame: boolean,
            inGameId: number
        } = {
            isInGame: false,
            inGameId: -1
        };
        if (game !== undefined) {
            const battleService = game.service;
            userInfo.isInGame = true;

            const playerInGame = battleService.GetBattle().GetPlayers().find(p => p.name === username);
            if (playerInGame === undefined) {
                userInfo.inGameId = -1;
                console.error('Could not find player in game for some reason?', username);
            }
            else {
                userInfo.inGameId = playerInGame.id;
                user.onlineStatus = NetworkPlayerStatus.InGame
            }
        }
        loggedInUsers.push(user);
        NotifyPlayerStatusChange();

        return res.json({ status: "success", username: req.body.name, userInfo: userInfo });
    }
});

app.get("/getvalidactions", async (req, res) => {
    const username = req.query.username;
    const gameInfo = games.find(info => info.players.find(name => name == username) !== undefined);
    const playerInGame = gameInfo?.service.GetPlayers().find(player => player.name === username);

    if (playerInGame === undefined) {
        console.log("could not get valid actions for player");
        return res.json({ error: true });
    }

    const validActions = await gameInfo?.service.GetValidActions(playerInGame.id);
    return res.json(validActions);
});


server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

