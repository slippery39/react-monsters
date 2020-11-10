import { Status } from 'game/HardStatus/HardStatus';
import React from 'react';
import './PokemonStatus.css'


interface Props {
    status : Status
}

function GetStatusClass(status:Status){
    switch(status){
        case Status.Burned:{
            return 'status-burned'
        }
        case Status.Frozen:{
            return 'status-frozen'
        }
        case Status.Paralyzed:{
            return 'status-paralyze'
        }
        case Status.Poison:{
            return 'status-poison'
        }
        case Status.ToxicPoison:{
            return 'status-poison'
        }
        case Status.Sleep:{
            return 'status-sleep'
        }    
        default:{
            return ''
        }    
    }
}

function GetStatusAbbreivation(status:Status){
    switch(status){
        case Status.Burned:{
            return 'BRN'
        }
        case Status.Frozen:{
            return 'FRZ'
        }
        case Status.Paralyzed:{
            return 'PAR'
        }
        case Status.Poison:{
            return 'PSN'
        }
        case Status.Sleep:{
            return 'SLP'
        }
        case Status.ToxicPoison:{
            return 'PSN'
        }
        case Status.None:{
            return ''
        }
        default:{
            return 'ERROR'
        }
    }
}

const PokemonStatus: React.FunctionComponent<Props> = (props) => {
     return (
            <div className ={'battle-status status-icon ' + GetStatusClass(props.status)}>
                {GetStatusAbbreivation(props.status)}
            </div>  
    );
}

export default PokemonStatus;