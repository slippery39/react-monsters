import React, {useState } from 'react';
import RandomTeamsSimMenu from './RandomTeams/RandomTeams';

import "./battlesim.css"
import RoundRobinSim from './RoundRobin1v1/RoundRobin1v1';

interface Props {
}


export interface WinLoss {
    wins: number,
    losses: number,
}


export type SimmedStats = Record<string, WinLoss>;




enum SimMode{
    RoundRobin1v1 = '1v1-Round-Robin',
    RandomTeams6v6 = '6v6-Random-Teams'
}

const BattleSimulatorMenu: React.FunctionComponent<Props> = () => {
    const [menuState,setMenuState] = useState<SimMode>(SimMode.RandomTeams6v6);

    const tabs = ()=>{
       return  (<div><div className="tab" onClick={()=>setMenuState(SimMode.RoundRobin1v1)}>1v1 Round Robin</div><div className="tab" onClick={()=>setMenuState(SimMode.RandomTeams6v6)}>6v6 Random Teams</div></div>)
    }

    return (
        <div className="battle-simulator-menu">
            <div> Battle Simulator!</div>
            {tabs()}
            {menuState === SimMode.RandomTeams6v6 && <RandomTeamsSimMenu/>}
            {menuState === SimMode.RoundRobin1v1 && <RoundRobinSim/>}
        </div>
    );
}

export default BattleSimulatorMenu;