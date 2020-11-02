import React from 'react';
import './BattleHealthDisplay.css';
import AnimatedHealthBar from 'components/AnimatedHealthBar/AnimatedHealthBar';
import AnimatedNumber from "components/AnimatedNumber/AnimatedNumber";
import PokemonStatus from "components/PokemonStatus/PokemonStatus";
import { IPokemon } from 'game/Pokemon/Pokemon';


interface Props {
    pokemon: IPokemon
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
                <AnimatedHealthBar animate={false} value={ (props.pokemon.currentStats.health/props.pokemon.originalStats.health) * 100} onComplete={()=>{ if(props.onHealthAnimateComplete){props.onHealthAnimateComplete()} } } />
            </div>
            <div className='battle-health-text'>
                <AnimatedNumber animate={false} number={props.pokemon.currentStats.health}/> / {props.pokemon.originalStats.health}
            </div>
        </div>
    );
}

export default BattleHealthDisplay;