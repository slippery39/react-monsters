import React from 'react';
import './BattleHealthDisplay.css';
import AnimatedHealthBar from 'components/AnimatedHealthBar/AnimatedHealthBar';
import AnimatedNumber from "components/AnimatedNumber/AnimatedNumber";
import PokemonStatus from "components/PokemonStatus/PokemonStatus";
import { Pokemon } from 'game/Pokemon/Pokemon';


interface Props {
    pokemon: Pokemon
    onHealthAnimateComplete?: () => void
}

const BattleHealthDisplay: React.FunctionComponent<Props> = (props) => {

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
                <AnimatedHealthBar animate={false} value={(props.pokemon.currentStats.hp / props.pokemon.originalStats.hp) * 100} onComplete={() => { if (props.onHealthAnimateComplete) { props.onHealthAnimateComplete() } }} />
            </div>
            <div className='battle-health-text'>
                <AnimatedNumber animate={false} number={props.pokemon.currentStats.hp} /> / {props.pokemon.originalStats.hp}
            </div>
        </div>
    );
}

export default BattleHealthDisplay;