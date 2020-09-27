import React from 'react'
import { Player, Pokemon } from '../../game/interfaces';
import PokemonImage from '../PokemonImage/PokemonImage';
import AnimatedHealthBar from '../AnimatedHealthBar/AnimatedHealthBar';
import './PokemonSwitchScreen.css'
import PokemonSwitchContainer from './PokemonSwitchContainer/PokemonSwitchContainer';

interface Props {
    player: Player
    onPokemonClick?: (pokemon: Pokemon) => void
    onCancelClick?: () => void
}

const PokemonSwitchScreen: React.FunctionComponent<Props> = (props) => {


    /*


        <div key={pokemon.id} className="switch-pokemon-item" onClick={() => { if (props.onPokemonClick) { props.onPokemonClick(pokemon); } }}>
            <div style={{ fontSize: '10px', width: '20px' }}> {index === 0 ? "ACTIVE" : ""} </div>
            <PokemonImage name={pokemon.name} type="small" />
            <div>{pokemon.name}</div>
            <div>
                <AnimatedHealthBar value={(pokemon.currentStats.health / pokemon.originalStats.health) * 100} />
                <div> {pokemon.currentStats.health} / {pokemon.originalStats.health}</div>
            </div>
        </div>)
    */

    const items = props.player.pokemon.map((pokemon, index) =>
        (
            <PokemonSwitchContainer key={pokemon.id} pokemon={pokemon} onClick={() => {
                if (props.onPokemonClick != undefined) {
                    props.onPokemonClick(pokemon)
                }
            }
            } />

        ));

    return (
        <div className="switch-menu" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3px' }}> Choose a pokemon to switch </div>
            <div>
                {items}
            </div>
            <div style={{margin:"0 auto",marginTop:"10px",marginBottom:"10px",}} onClick={() => { if (props.onCancelClick) { props.onCancelClick() } }} className="cancel-button"> Cancel </div>
        </div>
    );
}


export default PokemonSwitchScreen