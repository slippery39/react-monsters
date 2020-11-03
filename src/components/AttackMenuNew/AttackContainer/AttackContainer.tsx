import React from 'react';
import ElementIcon from "components/ElementIcon/ElementIcon";
import "./AttackContainer.css";
import { Technique } from 'game/Techniques/Technique';


interface Props {
    technique:Technique
    onAttackClick?:(tech:Technique)=>void
}

const AttackContainer: React.FunctionComponent<Props> = (props) => {


    const outerContainerClass = `outer-attack-container element-${props.technique.elementalType.toString().toLowerCase()}`
    return (
        <div className={outerContainerClass} onClick={(ev)=>{ if (props.onAttackClick!==undefined) props.onAttackClick(props.technique); }}>
        <div className="attack-container">
            <div className="attack-name">{props.technique.name}</div>
            <div style={{display: "flex","justifyContent": "space-between","alignItems":"baseline"}}
    ><span style={{marginRight:"5px"}}><ElementIcon element={props.technique.elementalType}/></span><span className="attack-pp">PP: {props.technique.currentPP} / {props.technique.pp}</span></div>
            
        </div>
        </div>
    );
}

export default AttackContainer