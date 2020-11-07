import { BattleEventType, GenericMessageEvent } from "game/BattleEvents";
import { IBeforeAttack, ICanApply, IEndOfTurn } from "game/HardStatus/HardStatus"
import { HasVolatileStatus, IPokemon } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";
import _ from "lodash";


export enum VolatileStatusType {
    Confusion = 'confusion',
    AquaRing = 'aqua-ring',


}

export interface VolatileStatus extends IBeforeAttack, IEndOfTurn, ICanApply {
    type: VolatileStatusType,
    InflictedMessage:(pokemon:IPokemon)=>string
}

abstract class AbstractVolatileStatus implements VolatileStatus {
    abstract type: VolatileStatusType
   

    constructor() {
    }

    abstract InflictedMessage(pokemon:IPokemon):string
    
    BeforeAttack(turn: Turn, pokemon: IPokemon) {

    }
    EndOfTurn(turn: Turn, pokemon: IPokemon) {

    }
    CanApply(turn: Turn, pokemon: IPokemon) {
        return true;
    }
}


export class ConfusionVolatileStatus extends AbstractVolatileStatus {

    type: VolatileStatusType = VolatileStatusType.Confusion;


    private unconfuseChance: number = 25;
    private damageSelfChance: number = 50

    constructor() {
        super();
    }

    inflictedMessage(pokemon:IPokemon){
        return `${pokemon.name} is now confused!`;
    }

    BeforeAttack(turn: Turn, pokemon: IPokemon) {

        if (pokemon.canAttackThisTurn === false) {
            return;
        }

        if (turn.Roll(this.unconfuseChance)) {
            //the attacking pokemon is no longer confused
            _.remove(pokemon.volatileStatuses, (vstatus) => vstatus.type === 'confusion');
            const unconfuseEvent: GenericMessageEvent = {
                type: BattleEventType.GenericMessage,
                defaultMessage: `${pokemon.name} has snapped out of its confusion!`
            }
            turn.AddEvent(unconfuseEvent);
        }
        else {
            const stillConfusedEvent: GenericMessageEvent = {
                type: BattleEventType.GenericMessage,
                defaultMessage: `${pokemon.name} is confused!`
            }
            turn.AddEvent(stillConfusedEvent);

            if (turn.Roll(this.damageSelfChance)) {
                const confusionHurtEvent: GenericMessageEvent = {
                    type: BattleEventType.GenericMessage,

                    defaultMessage: `${pokemon.name} has hurt itself in its confusion`
                }
                turn.AddEvent(confusionHurtEvent);
                turn.ApplyDamage(pokemon, 40, {});

                //pokemon skips the turn as well
                pokemon.canAttackThisTurn = false;
            }
        }



    }
    CanApply(turn: Turn, pokemon: IPokemon) {
        return !HasVolatileStatus(pokemon,this.type)
    }

    InflictedMessage(pokemon: IPokemon): string {
        return `${pokemon.name} is now confused!`
     }
    
}


export function GetVolatileStatus(type:VolatileStatusType): VolatileStatus{
    switch(type){
        case VolatileStatusType.Confusion:{
            return new ConfusionVolatileStatus();
        }
        default:{
            throw new Error(`${type} has not been implemtned in GetVolatileStatus`);
        }
    }
}






/*
export interface ConfusionVolatileStatus extends BaseVolatileStatus{
    type:'confusion'
}
*/

/*
interface Confusion{
    type
}*/

