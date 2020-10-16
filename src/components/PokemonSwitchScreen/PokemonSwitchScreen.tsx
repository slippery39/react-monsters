import React from 'react'
import { Player, Pokemon } from '../../game/interfaces';
import './PokemonSwitchScreen.css'
import PokemonSwitchContainer from './PokemonSwitchContainer/PokemonSwitchContainer';

interface Props {
    player: Player
    onPokemonClick?: (pokemon: Pokemon) => void
    onCancelClick?: () => void
    showCancelButton?: boolean
}

const PokemonSwitchScreen: React.FunctionComponent<Props> = (props) => {

    const items = props.player.pokemon.map((pokemon, index) =>
        (
            <PokemonSwitchContainer key={pokemon.id} pokemon={pokemon} onClick={() => {
                if (props.onPokemonClick !== undefined && pokemon.currentStats.health > 0) {
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
           {props.showCancelButton && <div style={{margin:"0 auto",marginTop:"10px",marginBottom:"10px",}} onClick={() => { if (props.onCancelClick) { props.onCancelClick() } }} className="cancel-button"> Cancel </div>}
        </div>
    );
}


export default PokemonSwitchScreen