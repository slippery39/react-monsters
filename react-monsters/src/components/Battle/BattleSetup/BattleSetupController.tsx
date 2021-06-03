import BasicAI from "game/AI/AI";
import LocalBattleService from "game/BattleService";
import { PlayerBuilder } from "game/Player/PlayerBuilder";
import React, { useState } from "react";
import Battle from "../Battle";
import BattleSetup, { BattleSettings } from "./BattleSetup";


function CreatePlayerVsPlayerBattle(settings: BattleSettings) {

    const player1Builder = new PlayerBuilder();
    settings.team1.forEach(name => { //this looks a bit weird but it works
        player1Builder.WithPokemon(name);
    });
    player1Builder.WithName("Player 1");
    player1Builder.Build();

    const player2Builder = new PlayerBuilder();

    settings.team2.forEach(name => {
        player2Builder.WithPokemon(name);
    });

    player2Builder.WithName("Player 2");
    player2Builder.Build();

    const player1 = player1Builder.Build();
    const player2 = player2Builder.Build();

    let battleService = new LocalBattleService(true);


    battleService.RegisterPlayer(player1);
    battleService.RegisterPlayer(player2);

    if (settings.team1Type === 'computer') {
        //adding a delay or else the ui gets really laggy for ai vs ai battles.
        new BasicAI(player1, battleService,{chooseDelayMS:1000});
    }
    //player 2 is always an ai for now.
    new BasicAI(player2, battleService);

    battleService.Initialize();
 
    return battleService;
}


const PlayerBattleController = () => {

    const [battleState, setBattleState] = useState<"setup" | "in-battle">("setup");
    const [battleService, setBattleService] = useState<LocalBattleService | undefined>(undefined);

    const handleSetupComplete = (settings:BattleSettings)=>{

        if (battleService === undefined){
            throw new Error(`battle service is undefined for some reason in our battle setup controller`);
        }
        setBattleService(CreatePlayerVsPlayerBattle(settings)); 
        setBattleState("in-battle");
        battleService.Start();
    }
    const handleBattleEnded = ()=>{
        setBattleState("setup");
    }

    return (
        <div>
            {battleState === "setup" && <BattleSetup onOk={handleSetupComplete} />}
            {(battleState === "in-battle" && battleService !== undefined) && <Battle onLoad={()=>battleService.Start()} allyPlayerID={battleService.GetPlayers()[0].id} battle={battleService} onEnd={handleBattleEnded} />}
        </div>
    )
}

export default PlayerBattleController;