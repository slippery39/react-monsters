import React, { useState } from 'react'
import "./StartGameScreen.css";

import {Button, Card} from 'antd';
import Title from 'components/_General/General';
import { GetAllPokemonInfo } from 'game/Pokemon/PremadePokemon';
import PokemonImage from 'components/PokemonImage/PokemonImage';
import styled, { keyframes } from 'styled-components';
import _ from 'lodash';

interface Props{
    onStartClick: ()=>void;
    onBattleSimClick:()=>void;
    onTestGameClick:()=>void;
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

const GetRandomPokemon = ()=>{
    return _.shuffle(GetAllPokemonInfo())[0].species
}

const StartGameScreen: React.FunctionComponent<Props> = (props) => {



    const [currentPokemon,setCurrentPokemon]  = useState<string>(GetRandomPokemon());

    return (
        <div className="start-screen-container">
            <Title>Pokemon Battle Simulator</Title>
            <Card style={{overflow:"hidden"}}><ComeFromLeft onAnimationIteration={()=>{
                console.log("animation has ended");
                setCurrentPokemon(GetRandomPokemon())
            }}><PokemonImage name={currentPokemon} type="front"/></ComeFromLeft></Card>
            <Button block type="primary" onClick={()=>props.onStartClick()} className="text-outline text-large">
             Play vs Computer Opponent
            </Button>
            <Button block type="primary" onClick={()=>props.onBattleSimClick()} className = "text-outline text-large">
                AI vs AI Battle Simulator
            </Button>
            <Button block type="primary" onClick={()=>props.onTestGameClick()} className="text-outline text-large">
                Developer Test Game
            </Button>
        </div>
    )
 }


export default StartGameScreen