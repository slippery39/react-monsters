import { Button, Card, Modal, PageHeader, Space, message, Radio } from "antd"
import PokemonImage from "components/PokemonImage/PokemonImage";
import TeamSelector from "components/TeamSelector/TeamSelector"
import { GetMultipleRandomPokemon } from "game/Pokemon/PremadePokemon";
import React, { useState } from "react"


export interface BattleSettings {
    team1: Array<string>,
    team1Type: "human" | "computer"
    team2: Array<string>
    //no support for changing the type of the second player for now.
}


interface Props {
    onOk: (settings: BattleSettings) => void;
}

type ModalState = "human" | "cpu" | "none";

const BattleSetup: React.FunctionComponent<Props> = (props) => {

    const [team1Pokemon, setTeam1Pokemon] = useState<Array<string>>([]);
    const [team2Pokemon, setTeam2Pokemon] = useState<Array<string>>([]);

    const [tempTeam1Pokemon, setTempTeam1Pokemon] = useState<Array<string>>([]);
    const [tempTeam2Pokemon, setTempTeam2Pokemon] = useState<Array<string>>([]);

    const [modalState, setModalState] = useState<ModalState>("none");

    const [team1PlayerType, setTeam1PlayerType] = useState<"human" | "computer">("human");


    const setupIsOk: () => boolean = () => {
        if (team1Pokemon.length === 0) {
            return false;
        }
        if (team2Pokemon.length === 0) {
            return false;
        }
        return true;
    }

    const handleStartClick = () => {
        if (!setupIsOk()) {
            message.error("Please choose at least 1 pokemon for each team");
            return;
        }

        props.onOk({
            team1: team1Pokemon,
            team1Type: team1PlayerType,
            team2: team2Pokemon
        });
    }

    const selectRandomTeam = (func:(a:any)=>any)=>{
        const randomTeam = GetMultipleRandomPokemon(6).map(poke=>poke.name);
        func(randomTeam);
    }

    const team1PlayerTypeUI = (
        <Radio.Group onChange={(e) => setTeam1PlayerType(e.target.value)} defaultValue={team1PlayerType}>
            <Radio.Button value="human">Human Player</Radio.Button>
            <Radio.Button value="computer">Computer Player</Radio.Button>
        </Radio.Group>)

    

    return (
        <div>
            <PageHeader><h1>Battle Setup</h1></PageHeader>
            <Card>
                <Space direction="vertical">
                    <div>Team 1</div>


                    <div><Space>{team1PlayerTypeUI}</Space></div>
                    <div><Space><Button onClick={() => { setTempTeam1Pokemon(team1Pokemon); setModalState("human") }}>Select Team</Button><Button type="primary" onClick={()=>selectRandomTeam(setTeam1Pokemon)}>Randomize</Button></Space></div>
                    <div className="pokemon-selection-container"> {team1Pokemon.map(name => <PokemonImage key={name} type="small" name={name} />)}</div>
                </Space>
            </Card>
            <Card>
                <Space direction="vertical">
                    <div>Team 2 </div>
                    <div><Space><Button onClick={() => { setTempTeam2Pokemon(team2Pokemon); setModalState("cpu") }}>Select Team</Button><Button type="primary" onClick={()=>selectRandomTeam(setTeam2Pokemon)}>Randomize</Button></Space></div>
                    <div className="pokemon-selection-container"> {team2Pokemon.map(name => <PokemonImage key={name} type="small" name={name} />)}</div>
                </Space>
            </Card>
            <Modal destroyOnClose={true} title="Select team for player 1" visible={modalState === "human"} onCancel={() => setModalState("none")} onOk={() => { setTeam1Pokemon(tempTeam1Pokemon); setModalState("none") }}>
                <TeamSelector defaultPokemon={tempTeam1Pokemon} onChange={(names) => setTempTeam1Pokemon(names)} maxPokemon={6} />
            </Modal>
            <Modal destroyOnClose={true} title="Select team for player 2" visible={modalState === "cpu"} onCancel={() => setModalState("none")} onOk={() => { setTeam2Pokemon(tempTeam2Pokemon); setModalState("none") }}>
                <TeamSelector defaultPokemon={tempTeam2Pokemon} onChange={(names) => setTempTeam2Pokemon(names)} maxPokemon={6} />
            </Modal>
            <Button size="large" onClick={handleStartClick} type="primary">Start Battle!</Button>
        </div>
    )
}

export default BattleSetup