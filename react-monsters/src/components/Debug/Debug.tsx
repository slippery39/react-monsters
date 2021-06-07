import React, { useState } from 'react';
import { BattleService } from 'game/BattleService';
import { GetActivePokemon } from 'game/HelperFunctions';
import './Debug.css'
import { Pokemon } from 'game/Pokemon/Pokemon';
import { Status } from 'game/HardStatus/HardStatus';
import { Field } from 'game/BattleGame';



function MakeStatusDropdown(poke: Pokemon, onChange: (evt: any) => void) {
    let statuses = [];
    for (let status in Status) {
        //var myElement: ElementType = ElementType[element as keyof typeof ElementType];
        var myElement: Status = Status[status as keyof typeof Status];
        statuses.push((<option value={myElement} key={status}>{status}</option>))
    }
    return (<select onChange={(evt) => onChange(evt)} value={poke.status}>
        {statuses}
    </select>)
}

/*
function MakeElementIcons() {
    var icons = [];
    for (let element in ElementType) {
        //var myElement: ElementType = ElementType[element as keyof typeof ElementType];
        var myElement: ElementType = ElementType[element as keyof typeof ElementType];
        icons.push((<ElementIcon key={myElement} element={myElement} />))
    }

    return (<div>{icons}</div>);
}
*/

interface Props {
    battleService: BattleService,
    field: Field
}


const Debug: React.FunctionComponent<Props> = (props) => {


    const [hidden, setHidden] = useState<boolean>(true);

    function GetAllyPokemon() {
        return GetActivePokemon(props.field.players[0]);
    }
    function GetEnemyPokemon() {
        return GetActivePokemon(props.field.players[1]);
    }

    function GetWeatherType(){
        return props.field.weather === undefined ? "No Active Weather" : props.field.weather.name
    }
    function GetWeatherDuration(){
        return props.field.weather === undefined ? "" : props.field.weather.duration
    }
    function GetWeatherCurrentTurn(){
        return props.field.weather === undefined ? "" : props.field.weather.currentTurn;
    }

    const hiddenClass = () => {
        return hidden ? "hidden" : ""
    }

    return (
        <div className='debug'>
            <div onClick={() => { setHidden(!hidden) }}> <b> Debug Info (Click to show / hide)</b> </div>
            <div className={hiddenClass()} >
                <div> 
                    <div>Field Info</div>
                    <div> Weather : {GetWeatherType()} </div>
                    <div> Weather Duration : {GetWeatherDuration()} </div>
                    <div> Weather Current Turn : {GetWeatherCurrentTurn()}</div>                    
                </div>               
                <div> Change Pokemon Status </div>
                <div>
                    Ally {MakeStatusDropdown(GetAllyPokemon(), (evt) => {
                    props.battleService.SetStatusOfPokemon(GetAllyPokemon().id, evt.target.value);
                }
                )}
                </div>
                <div>
                    Enemy {MakeStatusDropdown(GetEnemyPokemon(), (evt) => {
                    props.battleService.SetStatusOfPokemon(GetEnemyPokemon().id, evt.target.value);
                })}
                </div>
                <div> Ally Pokemon Volatile Statuses </div>
                <div> {GetAllyPokemon().volatileStatuses.map(vStat=>vStat.type)}</div>
                <div> Enemy Pokemon Volatile Statuses </div>
                <div> {GetEnemyPokemon().volatileStatuses.map(vStat=>vStat.type)}</div>
                <div> Entry Hazards on Ally Field</div>
                <div>{props.field.entryHazards.filter(entry=>entry.player && entry.player.id === props.field.players[0].id).map(obj=><div>{obj.type} Stage: {obj.stage}</div>)}</div>
                <div> Entry Hazards on Enemy Field</div>
                <div>{props.field.entryHazards.filter(entry=>entry.player && entry.player.id === props.field.players[1].id).map(obj=><div>{obj.type} Stage: {obj.stage}</div>)}</div>
            </div>
        </div>
    )
}

export default Debug;