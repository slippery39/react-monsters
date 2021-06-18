import React from 'react';
import RandomTeamsSimMenu from './RandomTeams/RandomTeams';
import "./battlesim.css"
import RoundRobinSim from './RoundRobin1v1/RoundRobin1v1';
import { Card, Tabs } from 'antd';
import Title from 'components/_General/General';

const { TabPane } = Tabs;

interface Props {
}

const BattleSimulatorMenu: React.FunctionComponent<Props> = () => {

    const tabs = () => {


        return (<Tabs defaultActiveKey="1">
            <TabPane tab="1v1" key="1">
                <RoundRobinSim />
            </TabPane>
            <TabPane tab="Random Team Battles" key="2">
                <RandomTeamsSimMenu />
            </TabPane>
        </Tabs>)
    }

    return (
        <Card>
            <div className="battle-simulator-menu">
                <Title>AI Battle Simulator</Title>
                {tabs()}
            </div>
        </Card>
    );
}

export default BattleSimulatorMenu;