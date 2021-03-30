import React from 'react';
import RandomTeamsSimMenu from './RandomTeams/RandomTeams';

import "./battlesim.css"
import RoundRobinSim from './RoundRobin1v1/RoundRobin1v1';

import {Tabs} from 'antd';

const {TabPane} = Tabs;

interface Props {
}




const BattleSimulatorMenu: React.FunctionComponent<Props> = () => {

    const tabs = ()=>{


       return(<Tabs defaultActiveKey="1">
            <TabPane tab="1v1" key="1">
                <RoundRobinSim/>
            </TabPane>
            <TabPane tab="Random Team Battles" key="2">
                <RandomTeamsSimMenu/>
            </TabPane>
        </Tabs>)
    }

    return (
        <div className="battle-simulator-menu">
            <div> Battle Simulator!</div>
            {tabs()}
        </div>
    );
}

export default BattleSimulatorMenu;