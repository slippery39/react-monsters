import React from 'react';
import { Pokemon } from "../../../game/interfaces";
import ElementIcon from "../../ElementIcon/ElementIcon";
import "./PokemonSwitchContainer.css";

import PokemonImage from "../../PokemonImage/PokemonImage";
import AnimatedHealthBar from '../../AnimatedHealthBar/AnimatedHealthBar';
import Pokeball from "../../Pokeball/Pokeball";

interface Props {
    pokemon: Pokemon
    onClick?: (pokemon: Pokemon) => void
}

const PokemonSwitchContainer: React.FunctionComponent<Props> = (props) => {


    /*
<div key={pokemon.id} className="switch-pokemon-item" onClick={() => { if (props.onPokemonClick) { props.onPokemonClick(pokemon); } }}>
            <div style={{ fontSize: '10px', width: '20px' }}> {index === 0 ? "ACTIVE" : ""} </div>
            <PokemonImage name={pokemon.name} type="small" />
            <div>{pokemon.name}</div>
            <div>
                <AnimatedHealthBar value={(pokemon.currentStats.health / pokemon.originalStats.health) * 100} />
                <div> {pokemon.currentStats.health} / {pokemon.originalStats.health}</div>
            </div>
        </div>

    */


    return (
        <div onClick={() => { if (props.onClick) { props.onClick(props.pokemon); } }} className="pokemon-switch-container">
            <div className="pokemon-switch-container-left">
                <div className="pokemon-switch-pokeball" style={{ width: "20px" }}><Pokeball /> </div>
                <div className="pokemon-switch-icon"><PokemonImage name={props.pokemon.name} type="small" /></div>
            </div>
            <div className="pokemon-switch-container-right">
                <div className="pokemon-switch-name">{props.pokemon.name}</div>
                <div>
                    <div className="pokemon-switch-healthbar"><AnimatedHealthBar value={(props.pokemon.currentStats.health / props.pokemon.originalStats.health) * 100} /></div>
                    <div className="pokemon-switch-healthbar-text"> {props.pokemon.currentStats.health} / {props.pokemon.originalStats.health} </div>
                </div>
            </div>
        </div>

    )


    /*
        const outerContainerClass = `outer-attack-container element-${props.technique.elementalType.toString().toLowerCase()}`
        return (
            <div className={outerContainerClass} onClick={(ev)=>{ if (props.onAttackClick!=undefined) props.onAttackClick(props.technique); }}>
            <div className="attack-container">
                <div className="attack-name">{props.technique.name}</div>
                <div style={{display: "flex","justifyContent": "space-between","alignItems":"baseline"}}
        ><span style={{marginRight:"5px"}}><ElementIcon element={props.technique.elementalType}/></span><span className="attack-pp">PP: {props.technique.currentPP} / {props.technique.pp}</span></div>
                
            </div>
            </div>
        );
        */
}

export default PokemonSwitchContainer