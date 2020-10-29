import { Turn } from "../BattleController";
import { BattleEventType, CannotAttackEvent } from "../BattleEvents";
import { Pokemon, Status } from "../interfaces";

interface IBeforeAttack{
    BeforeAttack :(turn:Turn,pokemon:Pokemon)=>void
}

class ParalyzeStatus implements IBeforeAttack{    

    private cantMoveChance: number = 25;
    
    BeforeAttack(turn:Turn,pokemon: Pokemon){     

        if (turn.Roll(this.cantMoveChance)) {
            const cantAttackEffect: CannotAttackEvent = {
                type: BattleEventType.CantAttack,
                targetPokemonId: pokemon.id,
                reason: Status.Paralyzed
            }
            turn.AddEvent(cantAttackEffect);
            pokemon.canAttackThisTurn = false;
            return;
        }
        //do the before logic here.
    }
}



function GetHardStatus(status:Status){

    if (status === Status.Paralyzed){
        return new ParalyzeStatus();
    }

    return null;
}

export default GetHardStatus;