import _ from "lodash";
import { Field } from "./BattleGame";
import { ElementType } from "./ElementType";
import GetHardStatus, { Status } from "./HardStatus/HardStatus";
import { Player } from "./Player/PlayerBuilder";
import { Pokemon } from "./Pokemon/Pokemon";
import { Stat } from "./Stat";
import { Technique } from "./Techniques/Technique";

export function GetActivePokemon(player: Player) {
    const pokemon = player.pokemon.find(p => p.id === player.currentPokemonId);

    if (pokemon === undefined) {
        throw new Error(`invalid pokemon id ${player.currentPokemonId}`);
    }

    return pokemon;
}

export function GetPercentageHealth(pokemon: Pokemon) {
    return (pokemon.currentStats.hp / pokemon.originalStats.hp) * 100
}


export function ResetStatBoosts(pokemon:Pokemon){
    pokemon.statBoosts[Stat.Attack] = 0;
    pokemon.statBoosts[Stat.Defense] = 0;
    pokemon.statBoosts[Stat.Accuracy] = 0;
    pokemon.statBoosts[Stat.SpecialAttack] = 0;
    pokemon.statBoosts[Stat.SpecialDefense] = 0;
    pokemon.statBoosts[Stat.Speed] = 0;
    pokemon.statBoosts[Stat.Accuracy] = 0;
}


export function IsFainted(pokemon: Pokemon) {
    return pokemon.currentStats.hp <= 0;
}

export function HasElementType(pokemon: Pokemon, element: ElementType) {
    return pokemon.elementalTypes.filter(t => t === element).length > 0;
}

export function GetPokemonOwner(players:Array<Player>,pokemon:Pokemon): Player{
    const owner = players.find(play=>{
        return play.pokemon.filter(poke=>poke.id === pokemon.id).length > 0
    });

    if (owner === undefined){
        throw new Error(`Could not find owner for pokemon of id ${pokemon.id} and name ${pokemon.name}. Please check the call to GetPokemonOwner()`);
    }

    return owner;
}



export function ClonePlayer(originalPlayer:Player){
    const newPokemons = originalPlayer.pokemon.map(poke=>{
        

        const statBoosts : Record<Stat,number> = {
            'accuracy':poke.statBoosts.accuracy,
            'attack':poke.statBoosts.attack,
            'defense':poke.statBoosts.defense,
            'special-attack':poke.statBoosts["special-attack"],
            'special-defense':poke.statBoosts["special-defense"],
            'speed':poke.statBoosts.speed
        }

        const pokeTechniques : Array<Technique> = [];
        for (var i=0;i<poke.techniques.length;i++){
            const tech = poke.techniques[i];
            pokeTechniques.push({...tech});
        }
   

        const newPoke :Pokemon = {
            name:poke.name,
            nature:poke.nature,
            originalStats:poke.originalStats,
             status:poke.status,
             _statusObj: [Status.Poison,Status.Paralyzed,Status.Frozen,Status.None].includes(poke.status) ? GetHardStatus(poke.status) : {...poke._statusObj},
            techniqueUsedLast: poke.techniqueUsedLast,
            weight:poke.weight,
            statBoosts:statBoosts,
            techniques:pokeTechniques,
            currentStats: {
                hp:poke.currentStats.hp,attack:poke.currentStats.attack,spAttack:poke.currentStats.spAttack,defense:poke.currentStats.defense,spDefense:poke.currentStats.spDefense,speed:poke.currentStats.speed},
            heldItem:_.clone(poke.heldItem),
            statMultipliers:[...poke.statMultipliers],
            volatileStatuses:poke.volatileStatuses.length === 0 ? [] : _.cloneDeep(poke.volatileStatuses),
            ivs:poke.ivs,
            ability:poke.ability,
            baseStats:poke.baseStats,
            canAttackThisTurn:poke.canAttackThisTurn,
            elementalTypes:[...poke.elementalTypes],
            evs:poke.evs,
            flashFireActivated:poke.flashFireActivated,
            hasSubstitute:poke.hasSubstitute,
            id:poke.id,
            fieldPosition:poke.fieldPosition
        }
        return newPoke;
    });

   

    const newPlayer:Player = {
        pokemon:newPokemons,
        currentPokemonId:originalPlayer.currentPokemonId,
        id:originalPlayer.id,
        items:originalPlayer.items,
        name:originalPlayer.name
    }

    
    return newPlayer;

}

//Cloning our field for performance reasons
//NOTE - Cloning the techniques seems to be taking up the majority of our time. we reduced our cloning time for 10000 iterations from around 4000 ms to 250 ms once we
//changed the techniques not to be deep cloned every time. Perhaps we need to think about how our techniques are actually stored in our data...
export function CloneField(originalField:Field){
  
  
    const newPlayers = originalField.players.map(p=>{

        const newPokemons = p.pokemon.map(poke=>{
        

            const statBoosts : Record<Stat,number> = {
                'accuracy':poke.statBoosts.accuracy,
                'attack':poke.statBoosts.attack,
                'defense':poke.statBoosts.defense,
                'special-attack':poke.statBoosts["special-attack"],
                'special-defense':poke.statBoosts["special-defense"],
                'speed':poke.statBoosts.speed
            }

            const pokeTechniques : Array<Technique> = [];
            for (var i=0;i<poke.techniques.length;i++){
                const tech = poke.techniques[i];
                pokeTechniques.push({...tech});
            }
       


            const newPoke :Pokemon = {
                name:poke.name,
                nature:poke.nature,
                originalStats:poke.originalStats,
                status:poke.status,
                _statusObj: [Status.Poison,Status.Paralyzed,Status.Frozen,Status.None].includes(poke.status) ? GetHardStatus(poke.status) : {...poke._statusObj},
                techniqueUsedLast: poke.techniqueUsedLast,
                weight:poke.weight,
                statBoosts:statBoosts,
                techniques:pokeTechniques,
                currentStats: {
                    hp:poke.currentStats.hp,attack:poke.currentStats.attack,spAttack:poke.currentStats.spAttack,defense:poke.currentStats.defense,spDefense:poke.currentStats.spDefense,speed:poke.currentStats.speed},
                heldItem:_.clone(poke.heldItem),
                statMultipliers:[...poke.statMultipliers],
                volatileStatuses:poke.volatileStatuses.length === 0 ? [] : _.cloneDeep(poke.volatileStatuses),
                ivs:poke.ivs,
                ability:poke.ability,
                baseStats:poke.baseStats,
                canAttackThisTurn:poke.canAttackThisTurn,
                elementalTypes:[...poke.elementalTypes],
                evs:poke.evs,
                flashFireActivated:poke.flashFireActivated,
                hasSubstitute:poke.hasSubstitute,
                id:poke.id,
                fieldPosition:poke.fieldPosition
            }

     
            return newPoke;

        });

        const newPlayer:Player = {
            pokemon:newPokemons,
            currentPokemonId:p.currentPokemonId,
            id:p.id,
            items:p.items,
            name:p.name
        }

        
        return newPlayer;

    });
    const newField = {
        entryHazards:originalField.fieldEffects?.length === 0? [] :_.cloneDeep(originalField.entryHazards),
        weather:_.clone(originalField.weather), //do we need to deep clone this? i don't think so right?
        fieldEffects: originalField.fieldEffects?.length === 0?  [] : _.cloneDeep(originalField.fieldEffects),
        players:newPlayers
    }
    return newField;}


export function GetAlivePokemon(player:Player){
    return player.pokemon.filter(poke=>poke.currentStats.hp>0);
}



