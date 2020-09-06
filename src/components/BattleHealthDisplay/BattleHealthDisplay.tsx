import React from 'react';
import './BattleHealthDisplay.css';
import AnimatedHealthBar from '../AnimatedHealthBar/AnimatedHealthBar';
import AnimatedNumber from "../AnimatedNumber/AnimatedNumber";
import PokemonStatus from "../PokemonStatus/PokemonStatus";
import { Pokemon } from '../../game/interfaces';

interface Props {
    pokemon: Pokemon
    onHealthAnimateComplete?: ()=>void
}

//HP <HealthBar value={(props.pokemon.currentStats.health / props.pokemon.originalStats.health) * 100} />

const BattleHealthDisplay: React.FunctionComponent<Props> = (props) => {




//need a ref to 

   return (
        <div className='battle-health-container'>
            <div className='battle-name-and-status-container'>
                <div className='battle-health-name'>
                    {props.pokemon.name}
                </div>
                {
                    props.pokemon.status &&
                    <PokemonStatus status={props.pokemon.status} />
                }
            </div>
            <div className='battle-health-bar'>
                <AnimatedHealthBar value={ (props.pokemon.currentStats.health/props.pokemon.originalStats.health) * 100} onComplete={()=>{ if(props.onHealthAnimateComplete){props.onHealthAnimateComplete()} } } />
            </div>
            <div className='battle-health-text'>
                <AnimatedNumber number={props.pokemon.currentStats.health}/> / {props.pokemon.originalStats.health}
            </div>
        </div>
    );
}

export default BattleHealthDisplay;