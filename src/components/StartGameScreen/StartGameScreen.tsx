import React from 'react'
import "./StartGameScreen.css";


interface Props{
    onStartClick: ()=>void;
}

const StartGameScreen: React.FunctionComponent<Props> = (props) => {

    return (
        <div>
            <div onClick={()=>props.onStartClick()} className="start-menu-button text-outline">
            Start Game!
            </div>
        </div>
    )
 }


export default StartGameScreen