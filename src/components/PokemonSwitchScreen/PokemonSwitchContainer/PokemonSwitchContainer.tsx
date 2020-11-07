import React from 'react';
import "./PokemonSwitchContainer.css";

import PokemonImage from "../../PokemonImage/PokemonImage";
import AnimatedHealthBar from '../../AnimatedHealthBar/AnimatedHealthBar';
import Pokeball from "../../Pokeball/Pokeball";
import PokemonStatus from "../../PokemonStatus/PokemonStatus";
import { IPokemon } from 'game/Pokemon/Pokemon';
import { Status } from 'game/HardStatus/HardStatus';

interface Props {
    pokemon: IPokemon
    onClick?: (pokemon: IPokemon) => void
}

const PokemonSwitchContainer: React.FunctionComponent<Props> = (props) => {

    let className = "pokemon-switch-container"

    if (props.pokemon.currentStats.health <= 0){
        className+= " pokemon-switch-fainted";
    }


    return (
        <div onClick={() => { if (props.onClick) { props.onClick(props.pokemon); } }} className={className}>
            <div className="pokemon-switch-container-left">
                <div className="pokemon-switch-pokeball" style={{ width: "20px" }}><Pokeball /> </div>
                <div className="pokemon-switch-icon"><PokemonImage name={props.pokemon.name} type="small" /></div>
            </div>
            <div className="pokemon-switch-container-right">
                <div className="pokemon-switch-name">{props.pokemon.name} <PokemonStatus status={props.pokemon.status || Status.None} /></div>
                
                <div>
                    <div className="pokemon-switch-healthbar"><AnimatedHealthBar animate={false} value={(props.pokemon.currentStats.health / props.pokemon.originalStats.health) * 100} /></div>
                    <div className="pokemon-switch-healthbar-text"> {props.pokemon.currentStats.health} / {props.pokemon.originalStats.health} </div>
                </div>
            </div>
        </div>
    )

}

export default PokemonSwitchContainer