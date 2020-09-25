import React from 'react';
import './AttackMenuNew.css'

interface Technique {
    id: number,
    name: String,
    description: String,
    currentPP: number,
    pp: number
}

interface Props {
    techniques: Array<Technique>,
    onAttackClick:(tech:Technique)=>void
}

const AttackMenu: React.FunctionComponent<Props> = (props) => {

    const techniques = props.techniques.map((el, index) => {
        return (
            <div onClick={(ev)=>props.onAttackClick(el)} key={el.id} className='technique-container'>
                <span>{el.name} </span> <span> PP :  {el.currentPP} / {el.pp} </span>
            </div>
        )
    });

    return (
        <div className="technique-menu">
            <div> Choose a technique to use </div>
            {techniques}
        </div>
    );
}

export default AttackMenu;