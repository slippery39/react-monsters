import React, { useState } from 'react';
import './App.css';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import BattleService from 'game/BattleService';
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
    const testPokemon = PokemonBuilder().OfSpecies("Missingno").WithTechniques([
      "Outrage",
      "Fire Blast"
    ])
      .WithAbility("Magic Guard")
      .WithHeldItem("Life Orb")
      .Build();

      //testPokemon.currentStats.hp = 1;


    const testPokemon2 = PokemonBuilder().OfSpecies("missingno").WithTechniques([
      "Stealth Rock"
    ])
      .OfElementalTypes([ElementType.Normal])
      .WithAbility("Intimidate")
      .WithHeldItem("Life Orb")
      .Build();


    const player1 = new PlayerBuilder(1)
      .WithName("Shayne")
      .WithPokemon("Salamence")
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
      .WithPokemon("raichu")
      .Build();

    let battleService = new BattleService(player1, player2);
    new BasicAI(player2, battleService);
    battleService.Initialize();
    //battleService.Start();
   

    return battleService;
  }

  return (
    <div className='app-window'>
      {appState === AppState.StartMenu ? <StartGameScreen onStartClick={handleStartClick} /> : <Battle battle={initializeBattle()} onEnd={handleEndGame} />}
    </div>
  )
}

export default App;
