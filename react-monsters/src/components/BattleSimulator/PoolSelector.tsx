import { Card, Collapse } from "antd"
import TeamSelector from "components/TeamSelector/TeamSelector"
import React from "react"

const { Panel } = Collapse;

interface Props{
    onChange:(pool:string[])=>void
    defaultPokemon:string[],
}

const PokemonPoolSelector: React.FunctionComponent<Props> =  (props) => {
    return (
        <Card>
            <Collapse defaultActiveKey={'1'}>
                <Panel header="Select Simulation Pool" key="1">
                    <TeamSelector amountNeededMessage={""} onChange={props.onChange} defaultPokemon={props.defaultPokemon} maxPokemon={999} />
                </Panel>
            </Collapse>
        </Card>
    )
}

export default PokemonPoolSelector;
