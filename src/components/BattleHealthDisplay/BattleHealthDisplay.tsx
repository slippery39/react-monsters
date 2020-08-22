import React from 'react';
import './BattleHealthDisplay.css';
import HealthBar from '../HealthBar/HealthBar';
import PokemonStatus from "../PokemonStatus/PokemonStatus";
import { Pokemon } from '../../game/interfaces';

interface Props {
    pokemon: Pokemon
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
                HP <HealthBar value={(props.pokemon.currentStats.health / props.pokemon.originalStats.health) * 100} />
            </div>
            <div className='battle-health-text'>
                {props.pokemon.currentStats.health} / {props.pokemon.originalStats.health}
            </div>
        </div>
    );
}

export default BattleHealthDisplay;