import React, { useState } from 'react';
import './App.css';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import BattleService from 'game/Battle';
import BasicAI from 'game/AI/AI';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { ElementType } from 'game/ElementType';


enum AppState {
  StartMenu = 'start-menu',
  InBattle = 'in-battle'
}

function App() {

  const [appState, setAppState] = useState<AppState>(AppState.StartMenu);


  function handleStartClick() {
    setAppState(AppState.InBattle);
  }
  function handleEndGame() {
    setAppState(AppState.StartMenu);
  }



  function initializeBattle() {

    //MISSINGNO!
    const testPokemon = PokemonBuilder().OfSpecies("missingno").WithTechniques([
      "Protect",
      "Fire Blast",
      "Rapid Spin",
      "Substitute"
    ])
      .WithAbility("Speed Boost")
      .WithHeldItem("Life Orb")
      .Build();


    const testPokemon2 = PokemonBuilder().OfSpecies("missingno").WithTechniques([
      "Stealth Rock"
    ])
      .OfElementalTypes([ElementType.Normal])
      .WithHeldItem("Life Orb")
      .Build();


    const player1 = new PlayerBuilder(1)
      .WithName("Shayne")
      .WithPokemon("Sceptile")
      .WithCustomPokemon(testPokemon)
      .WithPokemon("gengar")
      .WithPokemon("venusaur")
      .WithPokemon("blastoise")
      .WithPokemon("raichu")
      .WithPokemon("alakazam")
      .WithItem("Full Restore", 3)
      .WithItem("Antidote", 2)
      .WithItem("Hyper Potion", 3)
      .WithItem("Max Potion", 1)
      .Build();

    const player2 = new PlayerBuilder(2)
      .WithName("Bob")
      .WithCustomPokemon(testPokemon2)
      .WithPokemon("venusaur")
      .WithPokemon("venusaur")
      .WithPokemon("blastoise")
      .WithPokemon("raichu")
      .WithPokemon("alakazam")
      .WithItem("Potion", 1)
      .WithItem("Super Potion", 2)
      .WithItem("Hyper Potion", 3)
      .WithItem("Max Potion", 1)
      .Build();

    let battleService = new BattleService(player1, player2);
    new BasicAI(player2, battleService);
    battleService.Start();

    return battleService;
  }

  return (
    <div className='app-window'>
      {appState === AppState.StartMenu ? <StartGameScreen onStartClick={handleStartClick} /> : <Battle battle={initializeBattle()} onEnd={handleEndGame} />}
    </div>
  )
}

export default App;
