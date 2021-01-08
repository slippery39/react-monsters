import React from 'react';
import "./PokemonMiniInfoBox.css";

import PokemonImage from "../../PokemonImage/PokemonImage";
import AnimatedHealthBar from '../../AnimatedHealthBar/AnimatedHealthBar';
import Pokeball from "../../Pokeball/Pokeball";
import PokemonStatus from "../../PokemonStatus/PokemonStatus";
import { Pokemon } from 'game/Pokemon/Pokemon';
import { Status } from 'game/HardStatus/HardStatus';

interface Props {
    pokemon: Pokemon
    onClick?: (pokemon: Pokemon) => void
}

const PokemonMiniInfoBox: React.FunctionComponent<Props> = (props) => {

    let className = "pokemon-mini-info-container"

    if (props.pokemon.currentStats.hp <= 0){
        className+= " pokemon-mini-info-fainted";
    }


    return (
        <div onClick={() => { if (props.onClick) { props.onClick(props.pokemon); } }} className={className}>
            <div className="pokemon-mini-info-pokeball" style={{ width: "20px" }}><Pokeball /> </div>
            <div className="pokemon-mini-info-name">{props.pokemon.name} <PokemonStatus status={props.pokemon.status || Status.None} /></div>
            <div className="pokemon-mini-info-icon"><PokemonImage name={props.pokemon.name} type="small" /></div>
            <div className="pokemon-mini-info-healthbar"><AnimatedHealthBar animate={false} value={(props.pokemon.currentStats.hp / props.pokemon.originalStats.hp) * 100} /></div>
            <div className="pokemon-mini-info-healthbar-text"> {props.pokemon.currentStats.hp} / {props.pokemon.originalStats.hp} </div>
        </div>
    )

}

export default PokemonMiniInfoBox