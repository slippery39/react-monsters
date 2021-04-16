import { shuffle } from "lodash";
import { Actions, BattleAction, UseMoveAction } from "./BattleActions";
import { GetActivePokemon } from "./HelperFunctions";
import { Player } from "./Player/PlayerBuilder";
import { CalculateStatWithBoost } from "./Pokemon/Pokemon";
import { Stat } from "./Stat";


export function GetActionPriority(player:Player,action: BattleAction) {

    //priorities are defined from -5 to +7  https://bulbapedia.bulbagarden.net/wiki/Priority
    let priority: number = 0;
    switch (action.type) {
        case 'use-move-action': {    
            //we need some way to acess the move information from here?
            priority = GetTechniquePriority(player,action);
            break;
        }
        case 'use-item-action': {
            priority = 6;
            break;
        }
        case 'switch-pokemon-action': {
            priority = 7;
            break;
        }
    }
    return priority;
}

export function GetSpeedPriority(players:Array<Player>,actions:Array<BattleAction>) {
 
    //randomize the actions to prevent the same speed priority always going in favor of player 1
    return shuffle(actions).map(act => {
        const player = players.find(p => p.id === act.playerId);
        if (player === undefined) {
            console.error(`cannot find player with id ${act.playerId}`)
            return {
                action: act,
                speed: 0
            }
        }
        const activePokemon =  GetActivePokemon(player);
        return {
            action: act,
            speed:  CalculateStatWithBoost(activePokemon,Stat.Speed)
        }
    }).sort((a, b) => { return b.speed - a.speed});
}

function GetTechniquePriority(player:Player,action:UseMoveAction){
    const move = player.pokemon.map(poke=>poke.techniques).flat().find(tech=>tech.id===action.moveId);
    if (move === undefined){
        throw new Error(`Could not find technique to determine priority in GetTechniquePriority: techId: ${action.moveId}`);
    }
    return move.priority === undefined? 0 : move.priority;
}

export function GetMoveOrder(players:Array<Player>,actions:Array<BattleAction>) {
    const actionPriorities = actions.map(act => {

        const player = players.find(play=>play.id === act.playerId);
        
        if (player === undefined){
            throw new Error(`Could not find player with id ${act.playerId} in GetMoveOrder`)
        }

        let move = undefined;
        if (act.type === Actions.UseTechnique){
            move = player.pokemon.map(poke=>poke.techniques).flat().find(tech=>tech.id===act.moveId);
        }

        return {
            playerId: act.playerId,
            player:player,
            type:act.type,
            priority: GetActionPriority(player,act),
            action: act,
            techniqueUsed:move
        }
    }).sort((a, b) => b.priority - a.priority);

    let actionOrder: Array<BattleAction> = [];

    //Edge Case for when a pplayer uses the technique pursuit on a switch.
    if (actionPriorities.find(ap=>ap.techniqueUsed?.name==="Pursuit")!==undefined && actionPriorities.find(ap=>ap.type==='switch-pokemon-action')!==undefined){
        //The priority would put Pursuit first and the switch pokemon action second.

        const pursuitAction = actionPriorities.find(ap=>ap.techniqueUsed?.name === "Pursuit");

        if (pursuitAction === undefined){
            throw new Error(`Error with the pursuit action move order stuff`);
        }

        const switchAction = actionPriorities.find(ap=>ap.type==='switch-pokemon-action');

        if (switchAction === undefined){
            throw new Error(`Error finding the switch action in the pursuit move order stuff`);
        }

        actionOrder = [pursuitAction,switchAction].map(priority=>priority.action);
    }
    //2 cases here, the priority is equal, or the priorities are different
    else if (actionPriorities[0].priority === actionPriorities[1].priority) {
        //search for the active player's pokemons speed.
        actionOrder = GetSpeedPriority(players,actions).map(priority => priority.action);
    }
    else {
        //they should be sorted already.
        actionOrder = actionPriorities.map(priority => priority.action);
    }

    
   

    return actionOrder;
}