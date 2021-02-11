import React, { useState } from 'react';
import BattleService from 'game/BattleService';
import { ElementType } from 'game/ElementType';
import ElementIcon from 'components/ElementIcon/ElementIcon';
import { GetActivePokemon } from 'game/HelperFunctions';
import './Debug.css'
import { Pokemon } from 'game/Pokemon/Pokemon';
import { Status } from 'game/HardStatus/HardStatus';
import { Player } from 'game/Player/PlayerBuilder';


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


const Debug: React.FunctionComponent<Props> = (props) => {


    const [hidden, setHidden] = useState<boolean>(true);

    function GetAllyPokemon() {
        return GetActivePokemon(props.players[0]);
    }
    function GetEnemyPokemon() {
        return GetActivePokemon(props.players[1]);
    }

    const hiddenClass = () => {
        return hidden ? "hidden" : ""
    }



    return (
        <div className='debug'>
            <div onClick={() => { setHidden(!hidden) }}> <b> Debug Info (Click to show / hide)</b> </div>

            <div className={hiddenClass()} >
                <div><div>Element Icons</div>
                    {MakeElementIcons()}
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
            </div>
        </div>
    )
}

export default Debug;