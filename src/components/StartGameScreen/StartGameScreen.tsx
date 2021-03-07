import React from 'react'
import "./StartGameScreen.css";


interface Props{
    onStartClick: ()=>void;
    onBattleSimClick:()=>void;
}

const StartGameScreen: React.FunctionComponent<Props> = (props) => {

    return (
        <div>
            <div onClick={()=>props.onStartClick()} className="start-menu-button text-outline">
             Play vs Computer
            </div>
            <div onClick={()=>props.onBattleSimClick()} className = "start-menu-button text-outline">
                AI vs AI Battle Simulator`
            </div>
        </div>
    )
 }


export default StartGameScreen