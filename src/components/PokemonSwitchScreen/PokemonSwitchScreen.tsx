import React from 'react'
import { Player, Pokemon } from '../../game/interfaces';
import PokemonImage from '../PokemonImage/PokemonImage';
import AnimatedHealthBar from '../AnimatedHealthBar/AnimatedHealthBar';
import './PokemonSwitchScreen.css'

interface Props {
    player: Player
    onPokemonClick?: (pokemon:Pokemon) => void
}

const PokemonSwitchScreen: React.FunctionComponent<Props> = (props) => {
    const items = props.player.pokemon.map((pokemon, index) => {

        return (<div key={pokemon.id} className="switch-pokemon-item" onClick={() => { if (props.onPokemonClick) { props.onPokemonClick(pokemon); } }}>
            <div style={{ fontSize: '10px', width: '20px' }}> {index === 0 ? "ACTIVE" : ""} </div>
            <PokemonImage name={pokemon.name} type="small" />
            <div>{pokemon.name}</div>
            <div>
                <AnimatedHealthBar value={(pokemon.currentStats.health / pokemon.originalStats.health) * 100} />
                <div> {pokemon.currentStats.health} / {pokemon.originalStats.health}</div>
            </div>
        </div>)

    });
    return (
        <div className="switch-menu" style={{ width:'350px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3px' }}> Choose a pokemon to switch </div>
            {items}
        </div>
    );
}


export default PokemonSwitchScreen