import Battle from "components/Battle/Battle";
import BasicAI from "game/AI/AI";
import LocalBattleService from "game/BattleService";
import { PlayerBuilder } from "game/Player/PlayerBuilder";
import { PokemonBuilder } from "game/Pokemon/Pokemon";
import React from "react";

function initializeTestBattle() {

    const zapdos = PokemonBuilder()
        .GetPremadePokemon("Zapdos")
        .WithTechniques([
            "Giga Drain",]);


    const zapdos1 = zapdos.Build();


    const ppPokemon = PokemonBuilder()
        .GetPremadePokemon("Tentacruel")
        .Build();

    ppPokemon.techniques.forEach(tech => tech.currentPP = 1);
    zapdos1.techniques.forEach(tech => tech.currentPP = 1);



    //const dugtrio2 = dugtrioTest.Build();


    const player1 = new PlayerBuilder()
        .WithName("Shayne")
        .WithCustomPokemon(ppPokemon)
        .Build();

    const player2 = new PlayerBuilder()
        .WithName("Bob")
        .WithCustomPokemon(zapdos1)
        .Build();

    const battleService = new LocalBattleService(true);

    battleService.RegisterPlayer(player1);
    battleService.RegisterPlayer(player2);

    new BasicAI(player2, battleService);
    battleService.Initialize();

    return battleService;
}

interface Props {
    onEnd: () => void;
}

const DevTestBattle: React.FunctionComponent<Props> = (props) => {
    const testBattle = initializeTestBattle();
    return (<Battle allyPlayerID={1} onLoad={() => testBattle.Start()} showDebug battle={testBattle} onEnd={() => props.onEnd} />)
}

export default DevTestBattle;