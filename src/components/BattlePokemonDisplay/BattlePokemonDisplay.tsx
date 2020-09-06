import React from 'react'
import { Pokemon } from '../../game/interfaces';
import BattleHealthDisplay from '../BattleHealthDisplay/BattleHealthDisplay';
import PokemonImage from '../PokemonImage/PokemonImage';

export enum OwnerType {
    Ally = "ALLY",
    Enemy = "ENEMY"
};

interface Props {
    owner: OwnerType,
    pokemon: Pokemon,
    onHealthAnimateComplete?:()=>void
}

const BattlePokemonDisplay: React.FunctionComponent<Props> = (props) => {

    const styles = {
        width:'160px',
        display:'inline-block',
    }

     //basically the health bar is flipped for allies / enemies.
    const allyDisplay = (<div>
        <div style={styles}>
            <PokemonImage type="back" name={props.pokemon.name} />
        </div>
        <BattleHealthDisplay onHealthAnimateComplete={()=>{ if(props.onHealthAnimateComplete){props.onHealthAnimateComplete()}}}  pokemon={props.pokemon} />
    </div>)

    const enemyDisplay = (<div>
        <BattleHealthDisplay onHealthAnimateComplete={()=>{ if(props.onHealthAnimateComplete){props.onHealthAnimateComplete()}}}  pokemon={props.pokemon} />
        <div style={styles}>
            <PokemonImage type="front" name={props.pokemon.name} />
        </div>
    </div>)   
    

    return (
        props.owner === OwnerType.Ally ? allyDisplay : enemyDisplay
    );
}


export default BattlePokemonDisplay