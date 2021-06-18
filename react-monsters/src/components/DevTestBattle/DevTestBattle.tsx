import Battle from "components/Battle/Battle";
import BasicAI from "game/AI/AI";
import LocalBattleService from "game/BattleService";
import { PlayerBuilder } from "game/Player/PlayerBuilder";
import { PokemonBuilder } from "game/Pokemon/Pokemon";
import React from "react";

function initializeTestBattle() {

    const zapdosBuilder = PokemonBuilder()
        .GetPremadePokemon("Zapdos")
        .WithHeldItem("Choice Band")
        .WithTechniques([
            "Swords Dance",]);

    const zapdos1 = zapdosBuilder.Build();

    zapdos1.techniques.forEach(tech => {
        tech.currentPP = 1;
    })

    const otherBuilder = PokemonBuilder()
        .GetPremadePokemon("Dugtrio")
        .WithTechniques([
            "Swords Dance"
        ])

    const player1 = new PlayerBuilder()
        .WithName("Shayne")
        .WithCustomPokemon(zapdos1)
        .WithPokemon("Lucario")
        .WithPokemon("Tentacruel")
        .Build();

    const player2 = new PlayerBuilder()
        .WithName("Bob")
        .WithCustomPokemon(otherBuilder.Build())
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