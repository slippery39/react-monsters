import React from 'react'
import BattleHealthDisplay from 'components/BattleHealthDisplay/BattleHealthDisplay';
import PokemonImage from 'components/PokemonImage/PokemonImage';
import "./BattlePokemonDisplay.css";
import { IPokemon } from 'game/Pokemon/Pokemon';

export enum OwnerType {
    Ally = "ALLY",
    Enemy = "ENEMY"
};

interface Props {
    owner: OwnerType,
    pokemon: IPokemon,
    onHealthAnimateComplete?: () => void,
    imageRef: (el: any) => void,
    potionRef:(el:any) => void
}

const BattlePokemonDisplay: React.FunctionComponent<Props> = (props) => {

    let styles: any = {
        width: '160px',
        display: 'inline-block',
    }

    if (props.owner === OwnerType.Ally) {
        styles.left = "40px";
        styles.position = "absolute";
        styles.top = "151px"; //151 places the bottom of the image right on the edge. note that if the image has padding then it will not take into account this padding (i.e. the padding will still show)
        styles.display = "flex";
        styles.alignItems = "flex-end";
        styles.height = "90px";
        styles.justifyContent = "center";
    }
    else {
        styles.left = "240px";
        styles.position = "absolute";
        styles.top = "100px";
    }

    //basically the health bar is flipped for allies / enemies.
    const allyDisplay = (<div className="ally-display" style={{ position: "relative" }}>
        <div ref={props.imageRef} style={styles}>
            <div ref={props.potionRef} className="potion-healing">+++</div>
            {props.pokemon.hasSubstitute? <img src='./images/misc/substitute_back.png'/> : <PokemonImage type="back" name={props.pokemon.name} />}
        </div>
        <div className="pokemon-health-display" style={{ left: "20px", position: 'absolute', top: "70px" }}>
            <BattleHealthDisplay onHealthAnimateComplete={() => { if (props.onHealthAnimateComplete) { props.onHealthAnimateComplete() } }} pokemon={props.pokemon} />
        </div>
    </div>)

    const enemyDisplay = (<div className="enemy-display" style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "220px", top: "20px" }}>
            <BattleHealthDisplay onHealthAnimateComplete={() => { if (props.onHealthAnimateComplete) { props.onHealthAnimateComplete() } }} pokemon={props.pokemon} />
        </div>
        <div  ref={props.imageRef} style={styles}>
            <div ref={props.potionRef} className="potion-healing">+++</div>
            {props.pokemon.hasSubstitute? <img src='./images/misc/substitute_front.png'/>:<PokemonImage type="front" name={props.pokemon.name} />}
        </div>
    </div>)


    return (
        props.owner === OwnerType.Ally ? allyDisplay : enemyDisplay
    );
}


export default BattlePokemonDisplay