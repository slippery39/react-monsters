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
    technique:Technique
    onAttackClick:(tech:Technique)=>void
}

const AttackContainer: React.FunctionComponent<Props> = (props) => {


    return (
        <div className="attack-container">
            <div className="attack-name"></div>
            <div className="attack-element"></div>
            <div className="attack-pp"></div>
        </div>
    );
}

export default AttackContainer