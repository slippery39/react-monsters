import BasicAI from "game/AI/AI";
import LocalBattleService from "game/BattleService";
import { PlayerBuilder } from "game/Player/PlayerBuilder";
import React, { useState } from "react";
import Battle from "../Battle";
import BattleSetup, { BattleSettings } from "./BattleSetup";


function CreatePlayerVsPlayerBattle(settings: BattleSettings) {

    const player1Builder = new PlayerBuilder(1);
    settings.team1.forEach(name => { //this looks a bit weird but it works
        player1Builder.WithPokemon(name);
    });
    player1Builder.WithName("Player 1");
    player1Builder.Build();

    const player2Builder = new PlayerBuilder(2);

    settings.team2.forEach(name => {
        player2Builder.WithPokemon(name);
    });

    player2Builder.WithName("Player 2");
    player2Builder.Build();

    const player1 = player1Builder.Build();
    const player2 = player2Builder.Build();

    let battleService = new LocalBattleService(player1, player2, true);

    if (settings.team1Type === 'computer') {
        new BasicAI(player1, battleService);
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
        setBattleService(CreatePlayerVsPlayerBattle(settings)); 
        setBattleState("in-battle");
        battleService?.Start();
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