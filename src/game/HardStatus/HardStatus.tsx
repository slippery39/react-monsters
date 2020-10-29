import { Turn } from "../BattleController";
import { BattleEventType, CannotAttackEvent } from "../BattleEvents";
import { HasElementType } from "../HelperFunctions";
import { ElementType, Pokemon, Status } from "../interfaces";

interface IBeforeAttack{
    BeforeAttack :(turn:Turn,pokemon:Pokemon)=>void
}
interface ICanApply{
    CanApply:(turn:Turn,pokemon:Pokemon)=>void
}

class ParalyzeStatus implements IBeforeAttack,ICanApply{
     

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
    CanApply(turn:Turn,pokemon:Pokemon){
        return !HasElementType(pokemon,ElementType.Electric)
    }

}



function GetHardStatus(status:Status){

    if (status === Status.Paralyzed){
        return new ParalyzeStatus();
    }

    throw new Error(`Status ${status} not implemented for GetStatus`);
}

export default GetHardStatus;