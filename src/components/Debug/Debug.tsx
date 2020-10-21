import React from 'react';
import BattleService from '../../game/BattleService';
import { ElementType, Player, Pokemon, Status } from '../../game/interfaces';
import ElementIcon from '../ElementIcon/ElementIcon';
import './Debug.css'


function MakeStatusDropdown(poke: Pokemon,onChange:(evt:any)=>void) {
    let statuses = [];
    for (let status in Status) {
        //var myElement: ElementType = ElementType[element as keyof typeof ElementType];
        var myElement: Status = Status[status as keyof typeof Status];
        statuses.push((<option value={myElement} key={status}>{status}</option>))
    }
    return (<select onChange={(evt)=>onChange(evt)} value={poke.status}>
        {statuses}
    </select>)
}


function MakeElementIcons() {
    var icons = [];
    for (let element in ElementType) {
        //var myElement: ElementType = ElementType[element as keyof typeof ElementType];
        var myElement: ElementType = ElementType[element as keyof typeof ElementType];
        icons.push((<ElementIcon key={myElement} element={myElement} />))
    }

    return (<div>{icons}</div>);
}

interface Props {
    battleService: BattleService,
    players: Array<Player>
}

function GetCurrentPokemon(player: Player) {
    const currentPokemon = player.pokemon.find(poke => poke.id === player.currentPokemonId);
    if (currentPokemon === undefined) {
        throw new Error("Could not find current pokemon");
    }
    return currentPokemon;
}

const Debug: React.FunctionComponent<Props> = (props) => {

    function GetAllyPokemon(){
        return GetCurrentPokemon(props.players[0]);
    }
    function GetEnemyPokemon(){
        return GetCurrentPokemon(props.players[1]);
    }

    return (
        <div className='debug'>
            <b> Debug Info </b>
            <div> <div>Element Icons</div>
                {MakeElementIcons()}
            </div>
            <div> Change Pokemon Status </div>
            <div>
                Ally {MakeStatusDropdown(GetAllyPokemon(),(evt)=>{
                    console.log(evt.target.value);
                    props.battleService.SetStatusOfPokemon(GetAllyPokemon().id,evt.target.value);
                }
                )}
            </div>
            <div>
                Enemy {MakeStatusDropdown(GetEnemyPokemon(),(evt)=>{
                    console.log(evt.target.value)
                    props.battleService.SetStatusOfPokemon(GetEnemyPokemon().id,evt.target.value);
                })}
            </div>
        </div>
    )
}

export default Debug;