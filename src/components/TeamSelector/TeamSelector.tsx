import PokemonImage from "components/PokemonImage/PokemonImage";
import { GetAllPokemonInfo } from "game/Pokemon/PremadePokemon"
import _ from "lodash";
import React, { useEffect, useState } from "react";
import "./TeamSelector.css";

interface Props {
    maxPokemon: number,
    defaultPokemon?:Array<string>
    onChange?:(team:Array<string>)=>void;
    handleSubmitTeam?:(team:Array<string>)=>void;
    amountNeededMessage?:string;
}

const TeamSelector = (props: Props) => {
    const maxPokemon = props.maxPokemon
    const pokemon = GetAllPokemonInfo();


    const [selectedTeam, setSelectedTeam] = useState<Array<string>>([]);
    const selectedTeamIcons = selectedTeam.map(p => (<div key={p} onClick={()=>{handleSelectedTeamIconClick(p)}} className='team-selector-icon'><PokemonImage type="small" name={p} /></div>));

 
    useEffect(()=>{
        if (props.defaultPokemon === undefined){
            props.defaultPokemon = [];
        }

        setSelectedTeam([...props.defaultPokemon]);
    },[]);

    const pokemonIcons = pokemon.filter(p=>{
        return (!selectedTeam.includes(p.species));
    }).map(p=>{
        let iconClass = "team-selector-icon";
        return (<div key={p.species} className={iconClass} onClick={() => { handleIconClick(p.species) }}><PokemonImage type="small" name={p.species} /></div>)
    });

    /*
    const pokemonIcons = pokemon.map(p => {
        let iconClass = "team-selector-icon";
        if (selectedTeam.includes(p.species)) { 
             //iconClass += " team-selector-icon-selected"; remove this, testing whether or not we like the graying out of pokemon, or the complete removal of pokemon.
        }        
    })*/

    const handleIconClick = (name: string) => {
        if (selectedTeam.includes(name)) {
            return;
        }
        if (selectedTeam.length >= maxPokemon) {
            return;
        }
        let newArr = selectedTeam.slice();
        newArr.push(name);
        setSelectedTeam(newArr);
        if (props.onChange!==undefined){
            props.onChange(newArr);
        }
    }

    const handleSelectedTeamIconClick = (name:string)=>{

        let newArr = selectedTeam.slice();
        _.remove(newArr,(el)=>el === name);
        setSelectedTeam(newArr);
        if (props.onChange!==undefined){
            props.onChange(newArr);
        }
    }

    const amountNeededMessage = ()=>{
        if (props.amountNeededMessage!==undefined){
            return props.amountNeededMessage;
        }

        if (selectedTeam.length>=maxPokemon){
            return "Party is full!"
        }
        else{
            return (maxPokemon - selectedTeam.length) + " more pokemon needed!";
        }
    }

    return (
        <div>
            <div>Available Pokemon</div>
            <div className="pokemon-selection-container">{pokemonIcons}</div>
            <div style={{"marginTop":"10px"}}>Selected - {amountNeededMessage()}</div>
            <div className="pokemon-selection-container">{selectedTeamIcons}</div>
        </div>
    )
}


export default TeamSelector