import React, { useEffect, useState } from 'react';
import './App.css';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import BattleService from 'game/BattleService';
import BasicAI from 'game/AI/AI';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { waitForSecondsExample } from 'game/AI/CoroutineTest';

enum AppState {
  StartMenu = 'start-menu',
  InBattle = 'in-battle',
  SimulatingAIGames = 'sim-ai-games'
}

function App() {

  const [appState, setAppState] = useState<AppState>(AppState.StartMenu);


  function handleStartClick() {
    setAppState(AppState.InBattle);
  }
  function handleEndGame() {
    setAppState(AppState.StartMenu);
  }


function RunAIvsAIBattle(){

    const ai1= new PlayerBuilder(1)
      .WithName("AI John")
      .WithRandomPokemon(6)
      .Build();
    
    const ai2 =  new PlayerBuilder(2)
    .WithName("AI Bob")
    .WithRandomPokemon(6)
    .Build();


    let battleService = new BattleService(ai1, ai2);   
    new BasicAI(ai1,battleService);
    new BasicAI(ai2,battleService);


    let logs =0;

    const finalGameInfo : {
      notEnded:boolean,
      noWinningPlayer:boolean,
      winningPokemon:Array<string>
      losingPokemon:Array<string>
    } = {
      notEnded:false,
      noWinningPlayer:false,
      winningPokemon:[],
      losingPokemon:[]
    }
  
    battleService.onNewTurnLog.on((args)=>{
      logs++;
      console.log(logs);
       if (logs >=1000){ //put a limit here for now in case of never ending games...
          finalGameInfo.notEnded = true;
         battleService.EndGame();
      }
      if (args.currentTurnState === 'game-over'){
        battleService.EndGame();
        //get the names of the winning pokemon
        const winningPlayer = battleService.GetPlayers().find(p=>p.id ===args.winningPlayerId);
        if (winningPlayer === undefined){
          finalGameInfo.noWinningPlayer = true;
        }
        else{
          //grab the winners pokemon names
          const winningPokemon = winningPlayer.pokemon.map(poke=>poke.name);
          //grab the losers pokemon names
          const losingPokemon = battleService.GetPlayers().find(p=>p.id !==args.winningPlayerId)!.pokemon.map(poke=>poke.name);
          
          finalGameInfo.winningPokemon = winningPokemon;
          finalGameInfo.losingPokemon = losingPokemon;
        }

        console.warn(finalGameInfo);
      }
    });

    battleService.Initialize();
    battleService.Start();

    return finalGameInfo;
  }

function initializeBattle() {

    //MISSINGNO!
    /*
    const testPokemon = PokemonBuilder().GetPremadePokemon("Jolteon").WithTechniques([
      "Thunderbolt",
    ])
   .Build();

      //testPokemon.currentStats.hp = 1;
      */

      /*
      const results = [];
      
 for (var i=0;i<1000;i++){
   try{
  results.push(RunAIvsAIBattle());
   }
   catch(e){
     console.error("error in running battle...",e);
   }
 };
 */
   //waitForSecondsExample();
 

    const testPokemon2 = PokemonBuilder().GetPremadePokemon("Ampharos").WithTechniques([
      "Volt Switch"
    ])
   .Build();

   const testPokemon3 = PokemonBuilder()
   .GetPremadePokemon("Scizor")
   .WithTechniques([
     "U-Turn"
   ])
   .Build();
   

    

    const player1 = new PlayerBuilder(1)
      .WithName("Shayne")
       .WithRandomPokemon(6)
      .Build();

    const player2 = new PlayerBuilder(2)
      .WithName("Bob")
      .WithRandomPokemon(6)
      .Build();

    let battleService = new BattleService(player1, player2);
    new BasicAI(player2,battleService);
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
