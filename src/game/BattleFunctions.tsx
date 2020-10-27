import { shuffle } from "lodash";
import { BattleAction } from "./BattleActions";
import { GetActivePokemon } from "./HelperFunctions";
import { Player, Status } from "./interfaces";

export function  GetActionPriority(action: BattleAction) {

    //priorities are defined from -5 to +7  https://bulbapedia.bulbagarden.net/wiki/Priority
    let priority: number = 0;
    switch (action.type) {
        case 'use-move-action': {
            priority = 0;
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
            speed:  activePokemon.status === Status.Paralyzed ? activePokemon.currentStats.speed /2 : activePokemon.currentStats.speed
        }
    }).sort((a, b) => { return b.speed - a.speed});
}

export function GetMoveOrder(players:Array<Player>,actions:Array<BattleAction>) {
    const actionPriorities = actions.map(act => {
        return {
            playerId: act.playerId,
            priority: GetActionPriority(act),
            action: act
        }
    }).sort((a, b) => b.priority - a.priority);

    let actionOrder: Array<BattleAction> = [];

    //2 cases here, the priority is equal, or the priorities are different
    if (actionPriorities[0].priority === actionPriorities[1].priority) {
        //search for the active player's pokemons speed.
        actionOrder = GetSpeedPriority(players,actions).map(priority => priority.action);
    }
    else {
        //they should be sorted already.
        actionOrder = actionPriorities.map(priority => priority.action);
    }
    return actionOrder;
}