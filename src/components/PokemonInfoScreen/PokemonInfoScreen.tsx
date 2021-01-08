import AnimatedHealthBar from 'components/AnimatedHealthBar/AnimatedHealthBar';
import AttackContainer from 'components/AttackMenuNew/AttackContainer/AttackContainer';
import ElementIcon from 'components/ElementIcon/ElementIcon';
import PokemonImage from 'components/PokemonImage/PokemonImage';
import GetAbility from 'game/Ability/Ability';
import { Pokemon } from 'game/Pokemon/Pokemon';
import React, { useState } from 'react'
import "./PokemonInfoScreen.css"


interface Props {
    pokemon: Pokemon,
    onExitClick?:()=>void;
}

const PokemonInfo: React.FunctionComponent<Props> = (props) => {

    const [currentTab, setCurrentTab] = useState("stats");

    /*
   const testPokemon = PokemonBuilder()
       .OfSpecies("Charizard")
       .WithTechniques([
           "Fire Blast",
           "Focus Blast",
           "Roost",
           "Air Slash"
       ])
       .WithHeldItem("Leftovers")
       .WithAbility("Blaze")
       .Build();
   */
    const testPokemon = props.pokemon;

    const statData = [
        {
            statString: "Nature",
            amount: testPokemon.nature.toLocaleUpperCase()
        },
        {
            statString: "Attack",
            amount: testPokemon.originalStats.attack
        },
        {
            statString: "Defense",
            amount: testPokemon.originalStats.defense
        },
        {
            statString: "Sp Attack",
            amount: testPokemon.originalStats.spAttack
        },
        {
            statString: "Sp Defense",
            amount: testPokemon.originalStats.spDefense
        },
        {
            statString: "Speed",
            amount: testPokemon.originalStats.speed
        },
        {
            statString: "Item - " + testPokemon.heldItem.name,
            amount: testPokemon.heldItem.description
        },
        {
            statString: "Ability - " + GetAbility(testPokemon.ability).name,
            amount: GetAbility(testPokemon.ability).description
        }

    ];


    const infoStats = (<div className="info-table">

        <div> <div> Name </div> <div> {testPokemon.name}</div> </div>
        <div> <div> Type </div> <div style={{ display: "flex" }}>{testPokemon.elementalTypes.map((el, index) => <ElementIcon key={index} element={el} />)}</div> </div>
        <div><div>HP</div><div><div>{testPokemon.currentStats.hp} / {testPokemon.originalStats.hp}</div><AnimatedHealthBar value={(testPokemon.currentStats.hp / testPokemon.originalStats.hp) * 100} /></div></div>
        {statData.map((el, index) => {
            return (<div key={index}><div> {el.statString}</div><div>{el.amount}</div></div>);
        })}
    </div>);


    const infoMoves = (<div className="info-moves">
        {testPokemon.techniques.map((el, index) => {
            return (
                <div>
                    <AttackContainer onAttackClick={() => { }} technique={el} key={el.id} />
                    <div> {el.description} </div>
                </div>
            )
        })}
    </div>)

    const infoOther = (
        <div>[OTHER INFO PLACEHOLDER]</div>
    )

    function getTab() {
        if (currentTab === "stats") {
            return infoStats;
        }
        if (currentTab === "moves") {
            return infoMoves;
        }
        if (currentTab === "other") {
            return infoOther;
        }
    }

    function getSelected(name: string) {
        return currentTab === name ? "selected-tab" : ""
    }

    function triggerExitClick(){
        if (props.onExitClick){
            props.onExitClick();
        }
    }


    return (

        <div className="pokemon-info-container text-outline">
            <div className="info-pokemon-window">
                <div>
                    {testPokemon.name}
                </div>
                <div>
                    <PokemonImage name={testPokemon.name} type="front" />
                </div>
            </div>
            <div>
                <div className="info-navbar"><div className={getSelected("stats")} onClick={() => { setCurrentTab("stats") }}>General</div>
                    <div className={getSelected("moves")} onClick={() => { setCurrentTab("moves") }}>Techniques</div>
                    <div onClick={triggerExitClick} className="info-exit">Exit</div>
                </div>
                {getTab()}
            </div>


        </div>



    )
}


export default PokemonInfo;