import React from 'react';
import './AttackMenuNew.css'
import {Technique} from "../../game/interfaces";
import AttackContainer from "./AttackContainer/AttackContainer";

interface Props {
    techniques: Array<Technique>,
    onAttackClick:(tech:Technique)=>void,
    onCancelClick:()=>void
}

const AttackMenu: React.FunctionComponent<Props> = (props) => {

    const techniques = props.techniques.map((el, index) => {
        return (
            <AttackContainer onAttackClick={(ev)=>props.onAttackClick(el)} technique={el} key={el.id} />
        )
    });

    return (
        <div>
        <div className="technique-menu">
            {techniques}
        </div>
            <div onClick={()=>props.onCancelClick()} className="cancel-button"> Cancel </div>
        </div>
    );
}

export default AttackMenu;