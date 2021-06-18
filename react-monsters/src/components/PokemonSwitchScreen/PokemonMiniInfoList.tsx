import React from 'react'
import './PokemonMiniInfoList.css'
import PokemonMiniInfoBox from './PokemonMiniInfoBox/PokemonMiniInfoBox';
import { Pokemon } from 'game/Pokemon/Pokemon';
import { Player } from 'game/Player/PlayerBuilder';




interface Props {
    player: Player
    onPokemonClick?: (pokemon: Pokemon) => void
    onCancelClick?: () => void
    showCancelButton?: boolean
}

const PokemonMiniInfoLIst: React.FunctionComponent<Props> = (props) => {

    const items = props.player.pokemon.map((pokemon, index) =>
    (
        <PokemonMiniInfoBox key={pokemon.id} pokemon={pokemon} onClick={() => {
            if (props.onPokemonClick !== undefined && pokemon.currentStats.hp > 0) {
                props.onPokemonClick(pokemon)
            }
        }
        } />

    ));

    return (
        <div className="mini-info-list-menu" style={{ width: '100%' }}>
            <div className="mini-info-list-container">
                {items}
            </div>
            {props.showCancelButton && <div style={{ margin: "0 auto", marginTop: "10px", marginBottom: "10px", }} onClick={() => { if (props.onCancelClick) { props.onCancelClick() } }} className="cancel-button"> Cancel </div>}
        </div>
    );
}


export default PokemonMiniInfoLIst