//export type BattleEvent = (SwitchOutEvent | SwitchInEvent | DamageEvent | HealEvent | FaintedPokemonEvent | UseMoveEvent | UseItemEvent | StatusChangeEvent | CannotAttackEvent | GenericMessageEvent)

export enum VolatileStatusType{
    Confusion='confusion'
}

export type VolatileStatus = (ConfusionVolatileStatus)


export interface BaseVolatileStatus{
    type:string
}

export interface ConfusionVolatileStatus extends BaseVolatileStatus{
    type:'confusion'
}

/*
interface Confusion{
    type
}*/