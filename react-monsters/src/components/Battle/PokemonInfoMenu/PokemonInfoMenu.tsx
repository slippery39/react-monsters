import { Tabs } from "antd";
import PokemonInfo from "components/PokemonInfoScreen/PokemonInfoScreen";
import PokemonMiniInfoList from "components/PokemonSwitchScreen/PokemonMiniInfoList";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon, PokemonBuilder } from "game/Pokemon/Pokemon";
import React, { useState } from "react";

const { TabPane } = Tabs;

interface Props {
    players: Array<Player>,
    onCancelClick?: () => void;
}

const PokemonInfoMenu: React.FunctionComponent<Props> = (props) => {


    const [menuState, setMenuState] = useState<"show-info" | "show-list">("show-list");
    const [pokemon, setPokemon] = useState<Pokemon>(PokemonBuilder().UseGenericPokemon().Build());


    const onHandleCancel = () => {
        if (props.onCancelClick === undefined) {
            return;
        }
        props.onCancelClick();
    }

    const pokemonInfoMenu = (
        <div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Ally Pokemon" key="1">
                    <PokemonMiniInfoList
                        showCancelButton={true}
                        onCancelClick={onHandleCancel}
                        onPokemonClick={(pokemon) => {
                            setPokemon(pokemon);
                            setMenuState("show-info")
                        }}
                        player={props.players[0]} />
                </TabPane>
                <TabPane tab="Enemy Pokemon" key="2">
                    <PokemonMiniInfoList
                        showCancelButton={true}
                        onCancelClick={onHandleCancel}
                        onPokemonClick={(pokemon) => {
                            setPokemon(pokemon);
                            setMenuState("show-info")
                        }}
                        player={props.players[1]} />
                </TabPane>
            </Tabs>
        </div>)

    return (menuState === "show-list" ? pokemonInfoMenu : <PokemonInfo onExitClick={() => setMenuState("show-list")} pokemon={pokemon} />)

}

export default PokemonInfoMenu