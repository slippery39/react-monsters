import PokemonImage from "components/PokemonImage/PokemonImage";
import { PartySelectionContainer } from "components/_General/General";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    const pokemonIcons = pokemon.filter(p=>{
        return (!selectedTeam.includes(p.species));
    }).map(p=>{
        let iconClass = "team-selector-icon";
        return (<div key={p.species} className={iconClass} onClick={() => { handleIconClick(p.species) }}><PokemonImage type="small" name={p.species} /></div>)
    });


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
            <PartySelectionContainer>{pokemonIcons}</PartySelectionContainer>
            <div style={{"marginTop":"10px"}}>Selected - {amountNeededMessage()}</div>
            <PartySelectionContainer>{selectedTeamIcons}</PartySelectionContainer>
        </div>
    )
}


export default TeamSelector