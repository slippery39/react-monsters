import React from 'react';
import './PokemonStatus.css'
import {Status} from "../../game/interfaces";

interface Props {
    status : Status
}

const BattleHealthDisplay: React.FunctionComponent<Props> = (props) => {
     return (
            <div className ={'battle-status status-'+props.status.toLowerCase()}>
                {props.status}
            </div>  
    );
}

export default BattleHealthDisplay;