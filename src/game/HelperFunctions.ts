import PokemonMiniInfoBox from "components/PokemonSwitchScreen/PokemonMiniInfoBox/PokemonMiniInfoBox";
import _ from "lodash";
import { ElementType } from "./ElementType";
import { Player } from "./Player/PlayerBuilder";
import { Pokemon } from "./Pokemon/Pokemon";
import { Stat } from "./Stat";
import { Technique } from "./Techniques/Technique";
import { Field } from "./Turn";

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
            for (var i=0;i<pokeTechniques.length;i++){
                const tech = pokeTechniques[i];
                pokeTechniques.push({...tech});
            }
       

            const newPoke:any = {};
            newPoke.name = poke.name;
            newPoke.nature = poke.nature;
            newPoke.originalStats = poke.originalStats;
            newPoke.restTurnCount = poke.restTurnCount;
            newPoke.status = poke.status;
            newPoke.techniqueUsedLast = poke.techniqueUsedLast;
            newPoke.toxicCount = poke.toxicCount;
            newPoke.weight = poke.weight;

            newPoke.statBoosts = statBoosts;
            newPoke.techniques = [...poke.techniques];
            newPoke.currentStats = {
                hp:poke.currentStats.hp,attack:poke.currentStats.attack,spAttack:poke.currentStats.spAttack,defense:poke.currentStats.defense,spDefense:poke.currentStats.spDefense,speed:poke.currentStats.speed}
            newPoke.heldItem = _.cloneDeep(poke.heldItem);
            newPoke.statMultipliers = _.cloneDeep(poke.statMultipliers);
            newPoke.volatileStatuses = _.cloneDeep(poke.volatileStatuses);  
            newPoke.ivs = poke.ivs
            newPoke.ability = poke.ability;
            newPoke.baseStats = poke.baseStats;
            newPoke.canAttackThisTurn = poke.canAttackThisTurn;
            newPoke.elementalTypes = poke.elementalTypes;
            newPoke.evs = poke.evs;
            newPoke.flashFireActivated = poke.flashFireActivated;
            newPoke.hasSubstitute = poke.hasSubstitute;
            newPoke.id = poke.id;
                

            return newPoke as Pokemon;
        });

        p.pokemon = newPokemons;
        return p;

    });
    const newField = {
        entryHazards:_.cloneDeep(originalField.entryHazards),
        weather:_.cloneDeep(originalField.weather),
        fieldEffects:_.cloneDeep(originalField.fieldEffects),
        players:newPlayers
    }
    return newField;}


export function GetAlivePokemon(player:Player){
    return player.pokemon.filter(poke=>poke.currentStats.hp>0);
}



