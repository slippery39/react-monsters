import React from 'react'
import "./StartGameScreen.css";

import {Button, PageHeader} from 'antd';

interface Props{
    onStartClick: ()=>void;
    onBattleSimClick:()=>void;
    onTestGameClick:()=>void;
}

const StartGameScreen: React.FunctionComponent<Props> = (props) => {

    return (
        <div className="start-screen-container">
            <PageHeader><h1>Pokemon Battle Simulator</h1></PageHeader>
            <Button block type="primary" onClick={()=>props.onStartClick()} className="text-outline text-large">
             Play vs Computer Opponent
            </Button>
            <Button block type="primary" onClick={()=>props.onBattleSimClick()} className = "text-outline text-large">
                AI vs AI Battle Simulator
            </Button>
            <Button block type="primary" onClick={()=>props.onTestGameClick()} className="text-outline text-large">
                Test Game 
            </Button>
        </div>
    )
 }


export default StartGameScreen