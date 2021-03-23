import PokemonImage from "components/PokemonImage/PokemonImage";
import { GetAllPokemonInfo } from "game/Pokemon/PremadePokemon"
import _ from "lodash";
import React, { useState } from "react";
import "./TeamSelector.css";

interface Props {
    maxPokemon: number,
    handleSubmitTeam?:(team:Array<string>)=>void;
}

const TeamSelector = (props: Props) => {
    const maxPokemon = props.maxPokemon
    const pokemon = GetAllPokemonInfo();
    const [selectedTeam, setSelectedTeam] = useState<Array<string>>([]);
    const selectedTeamIcons = selectedTeam.map(p => (<div key={p} onClick={()=>{handleSelectedTeamIconClick(p)}} className='team-selector-icon'><PokemonImage type="small" name={p} /></div>));

    const pokemonIcons = pokemon.map(p => {
        let iconClass = "team-selector-icon";
        if (selectedTeam.includes(p.species)) {
            iconClass += " team-selector-icon-selected";
        }
        return (<div key={p.species} className={iconClass} onClick={() => { handleIconClick(p.species) }}><PokemonImage type="small" name={p.species} /></div>)
    });

    const handleIconClick = (name: string) => {
        if (selectedTeam.includes(name)) {
            return;
        }
        if (selectedTeam.length >= maxPokemon) {
            return;
        }
        setSelectedTeam(p => {
            let newArr = p.slice();
            newArr.push(name);
            return newArr;
        })
    }

    const handleSelectedTeamIconClick = (name:string)=>{
        setSelectedTeam(p=>{
            let newArr = p.slice();
            _.remove(newArr,(el)=>el === name);
            return newArr;
        });
    }

    const amountNeededMessage = ()=>{
        if (selectedTeam.length>=maxPokemon){
            return "Party is full!"
        }
        else{
            return (maxPokemon - selectedTeam.length) + " more pokemon needed!";
        }
    }

    return (
        <div>
            <div className="team-selector-all-container">{pokemonIcons}</div>
            <div>Your Team - {amountNeededMessage()}</div>
            <div className="team-selector-selected-container">{selectedTeamIcons}</div>
            {selectedTeam.length === maxPokemon &&<button onClick={()=>{props.handleSubmitTeam?.(selectedTeam)}} type="button">Submit!</button>}
        </div>
    )
}


export default TeamSelector