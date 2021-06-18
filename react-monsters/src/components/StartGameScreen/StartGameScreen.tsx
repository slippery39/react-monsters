import React, { useState } from 'react'
import "./StartGameScreen.css";

import { Button, Card } from 'antd';
import Title from 'components/_General/General';
import { GetAllPokemonInfo } from 'game/Pokemon/PremadePokemon';
import PokemonImage from 'components/PokemonImage/PokemonImage';
import styled, { keyframes } from 'styled-components';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';



interface Props {
}

//Animation that is used with with the styled div below
const comeFromLeft = keyframes`
0%   { left:-1000px; }
50%  { left:0px;}
90% {left:0px;}
100% { left:1000px;}
`


const ComeFromLeft = styled.div`{
    display:inline-block;
    left:-1000px;
    overflow:hidden;
    position:relative;
    width:300px;
    animation-name: ${comeFromLeft};
    animation-duration: 4s;
    animation-iteration-count: infinite;
    transform-origin:bottom;
    animation-timing-function: cubic-bezier(0.42, 0.0, 0.58, 1);
}`

const GetRandomPokemon = () => {
    return _.shuffle(GetAllPokemonInfo())[0].species
}

const StartGameScreen: React.FunctionComponent<Props> = (props) => {

    const history = useHistory();

    
  function handleHumanVsCPU() {
    history.push('/battle');
  }
  function handleBattleSimClick(){
    history.push('./battle-simulator')
  }

  function handleTestGameClick(){
    history.push("./devtestbattle");
  }


  function handleConnectToServerClick(){
      history.push("./networked-play");
  }


    const [currentPokemon, setCurrentPokemon] = useState<string>(GetRandomPokemon());

    return (
        <Card>
        <div className="start-screen-container">
            <Title>Pokemon Battle Simulator</Title>
            <Card style={{ overflow: "hidden" }}><ComeFromLeft onAnimationIteration={() => {
                setCurrentPokemon(GetRandomPokemon())
            }}><PokemonImage name={currentPokemon} type="front" /></ComeFromLeft></Card>
            <Card>            <div>
            <Button block type="primary" onClick={() => handleHumanVsCPU()} className="text-outline text-large">
                Play vs Computer Opponent
            </Button>
            </div>
            <div>
            <Button block type="primary" onClick={() => handleBattleSimClick()} className="text-outline text-large">
                AI vs AI Battle Simulator
            </Button>
            </div>
            <div>
            <Button block type="primary" onClick={() => handleConnectToServerClick()} className="text-outline text-large">
                Connect to server
            </Button>
            </div>
            {false &&<Button block type="primary" onClick={() => handleTestGameClick()} className="text-outline text-large">
                Developer Test Game
            </Button>}
            </Card>
        </div>
        </Card>
    )
}


export default StartGameScreen