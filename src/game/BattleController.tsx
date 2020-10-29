import { Pokemon, Player, Technique, Status, ElementType } from './interfaces';
import { GetBaseDamage, GetDamageModifier } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';
import { DamageEvent, FaintedPokemonEvent, HealEvent, SwitchInEvent, SwitchOutEvent, UseItemEvent, UseMoveEvent, BattleEventType, CannotAttackEvent, StatusChangeEvent, GenericMessageEvent, BattleEvent } from "./BattleEvents";
import { SwitchPokemonAction, BattleAction } from "./BattleActions";
import { HasElementType } from './HelperFunctions';
import GetHardStatus from './HardStatus/HardStatus';


export type TurnState = 'awaiting-initial-actions' | 'awaiting-switch-action' | 'turn-finished' | 'game-over' | 'calculating-turn';


enum BattleStepState {
    PreAction1 = 'pre-action-1',
    Action1 = 'action1',
    PostAction1 = 'post-action-1',
    PreAction2 = 'pre-action-2',
    Action2 = 'action-2',
    PostAction2 = 'post-action-2',
    BeforeEnd = 'before-end',
    End = 'end'
}

interface State {
    type: TurnState,
    playerId?: number, //depreciated
    faintedPlayerIds?: Array<number>,
    nextState?: TurnState,
    winningPlayerId?: number
}

export class Turn {
    //need to store the state here somehow.
    initialActions: Array<BattleAction> = [];

    players: Array<Player> = [] //needs to be initial turn state.
    turnLog: Array<BattleEvent> = [];
    id: Number;
    eventNum: number = 1; //next id for when we have a new event.

    faintedPokemonPlayers: Array<Player> = []; //stores players who currenty have a fainted pokemon, players with a fainted pokemon must immediatley put a new one into play.

    private itemIdCount = 1;
    private pokemonIdCount = 1;

    private _moveOrder: Array<BattleAction> = [];

    //Pokemon ids at start of the turn, so we know if to skip an action.
    private _activePokemonIdAtStart1 = -1;
    private _activePokemonIdAtStart2 = -1;

    private _switchFaintedActions: Array<SwitchPokemonAction> = [];

    currentBattleStep = BattleStepState.PreAction1;

    currentState: State = { type: 'awaiting-initial-actions' }

    constructor(turnId: Number, players: Array<Player>) {
        this.id = turnId;
        this.players = players;

        this.AutoAssignPokemonIds();
        this.AutoAssignCurrentPokemonIds();
        this.AutoAssignItemIds();


        //this controls some logic in the turn.
        this._activePokemonIdAtStart1 = players[0].currentPokemonId;
        this._activePokemonIdAtStart2 = players[1].currentPokemonId;
    }
    //NEW: Returning a flattened turn log instead
    GetTurnLog(): Array<BattleEvent> {
        return this.turnLog;
    }

    SetInitialPlayerAction(action: BattleAction) {
        const actionExistsForPlayer = this.initialActions.filter(act => act.playerId === action.playerId);
        if (actionExistsForPlayer.length === 0) {
            this.initialActions.push(action);
        }
        if (this.initialActions.length === 2) {
            this.currentState = {
                type: 'calculating-turn'
            }
            this.CalculateTurn();
        }
    }
    //Special Action for when a pokemon faints in the middle of the turn.
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction) {
        if (this.faintedPokemonPlayers.filter(p => p.id === action.playerId).length === 0) {
            throw new Error("Invalid command in SetSwitchFaintedPokemonAction, this player should not be switching a fainted pokemon");
        }

        //TODO - we need a check to make sure the same player cannot add 2 actions
        if (this._switchFaintedActions.filter((act) => {
            return act.playerId === action.playerId
        }).length > 0) {
            throw new Error(`Player tried to submit 2 switch fainted pokemon actions: id : ${action.playerId}`);
        }
        this._switchFaintedActions.push(action);

        const player = this.faintedPokemonPlayers.find(p => p.id === action.playerId);
        if (player === undefined) {
            throw new Error('could not find player');
        }
        const index = this.faintedPokemonPlayers.indexOf(player);
        this.faintedPokemonPlayers.splice(index, 1);

        if (this.faintedPokemonPlayers.length === 0) {
            this._switchFaintedActions.forEach(act => {
                this.SwitchPokemon(act.playerId, act.switchPokemonId);
            });

            this.currentState = {
                type: this.currentState.nextState!
            };
            //continue calculating the turn
            this.CalculateTurn();
        }
    }

    private BeforeEndOfTurn() {
        //end of turn order is just the order of the players.
        //apply poison

        //Get both active pokemon.
        const activePokemon = this.players.map(player => this.GetActivePokemon(player.id));

        //apply poison damage
        activePokemon.forEach(pokemon => {
            if (pokemon.status === Status.Poison) {
                //apply poison damage
                //poison damage is 1/16 of the pokemons max hp
                const maxHp = pokemon.originalStats.health;
                const poisonDamage = Math.ceil(maxHp / 8);
                pokemon.currentStats.health -= poisonDamage;

                const poisonMessage: GenericMessageEvent = {
                    type: BattleEventType.GenericMessage,
                    defaultMessage: `${pokemon.name} is hurt by poison`
                }
                this.AddEvent(poisonMessage);
                this.ApplyDamage(pokemon, poisonDamage, {})
            }
            else if (pokemon.status === Status.Burned) {
                const maxHp = pokemon.originalStats.health;
                const burnDamage = Math.ceil(maxHp / 8);
                const burnMessage: GenericMessageEvent = {
                    type: BattleEventType.GenericMessage,
                    defaultMessage: `${pokemon.name} is hurt by its burn`
                }
                this.AddEvent(burnMessage);
                this.ApplyDamage(pokemon, burnDamage, {});
            }
        })
    }

    //Any status conditions or whatever that must apply before the pokemon starts to attack.
    private BeforeAttack(pokemon: Pokemon) {
        //by default we assume the pokemon will be able to attack unless determined otherwise.
        pokemon.canAttackThisTurn = true;

        if (pokemon.status === Status.Paralyzed) {
            GetHardStatus(Status.Paralyzed)?.BeforeAttack(this,pokemon);
        }
        else if (pokemon.status === Status.Sleep) {

            const wakeUpChance = 40;
            const isAsleepEffect: GenericMessageEvent = {
                type: BattleEventType.GenericMessage,
                defaultMessage: `${pokemon.name} is sleeping!`
            }
            this.AddEvent(isAsleepEffect);
            if (this.Roll(wakeUpChance)) {
                //Pokemon Wakes Up
                pokemon.status = Status.None;

                const wakeupEffect: StatusChangeEvent = {
                    type: BattleEventType.StatusChange,
                    targetPokemonId: pokemon.id,
                    status: Status.None,
                    defaultMessage: `${pokemon.name} has woken up!`
                }
                this.AddEvent(wakeupEffect);
                return;
            }
            else {
                pokemon.canAttackThisTurn = false;
                return;
            }
        }
        else if (pokemon.status === Status.Frozen) {
            const thawChance = 25;
            const isFrozenEffect: GenericMessageEvent = {
                type: BattleEventType.GenericMessage,
                defaultMessage: `${pokemon.name} is frozen!`
            }
            this.AddEvent(isFrozenEffect);

            if (this.Roll(thawChance)) {
                //Pokemon Wakes Up
                pokemon.status = Status.None;

                const thawEffect: StatusChangeEvent = {
                    type: BattleEventType.StatusChange,
                    targetPokemonId: pokemon.id,
                    status: Status.None,
                    defaultMessage: `${pokemon.name} is not frozen anymore!`
                }
                this.AddEvent(thawEffect);
            }
            else {
                pokemon.canAttackThisTurn = false;
            }
        }
    }
    private DoAction(action: BattleAction) {
        switch (action.type) {
            case 'switch-pokemon-action': {
                this.SwitchPokemon(action.playerId, action.switchPokemonId);
                break;
            }
            case 'use-item-action': {
                this.UseItem(action.playerId, action.itemId);
                break;
            }
            case 'use-move-action': {
                this.UseTechnique(action.playerId, action.pokemonId, action.moveId);
                break;
            }
        }
    }

    //For testing only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetPokemon(pokemonId).status = status;
        //need some way of notifying the service.
    }

    private PokemonFainted(pokemon: Pokemon) {
        const faintedPokemonEffect: FaintedPokemonEvent = {
            targetPokemonId: pokemon.id,
            type: BattleEventType.PokemonFainted,
        };
        this.AddEvent(faintedPokemonEffect);

        const owner = this.GetPokemonOwner(pokemon);

        //game over check.
        if (owner.pokemon.filter(poke => poke.currentStats.health > 0).length === 0) {
            const winningPlayer = this.players.filter(player => player.id !== owner.id)[0];
            this.currentState = {
                type: 'game-over',
                winningPlayerId: winningPlayer.id
            }
        }
        else {

            this.faintedPokemonPlayers.push(owner);

            this.currentState = { type: 'awaiting-switch-action' }
        }
    }

    private ApplyDamage(pokemon: Pokemon, damage: number, damageInfo: any) {

        pokemon.currentStats.health -= damage
        pokemon.currentStats.health = Math.max(0, pokemon.currentStats.health);

        const damageEffect: DamageEvent = {
            type: BattleEventType.Damage,
            targetPokemonId: pokemon.id,
            attackerPokemonId: pokemon.id, //this is wrong, we need a way to pass this into this function 
            targetFinalHealth: pokemon.currentStats.health,
            targetDamageTaken: damage,
            didCritical: damageInfo.critStrike === undefined ? false : damageInfo.critStrike,
            effectivenessAmt: damageInfo.typeEffectivenessBonus === undefined ? 1 : damageInfo.typeEffectivenessBonus
        };

        this.AddEvent(damageEffect);

        if (pokemon.currentStats.health <= 0) {
            this.PokemonFainted(pokemon)
        }
    }

    private AfterAttack(pokemon: Pokemon) {
        //we could put burn effects here.
    }

    private CalculateTurn() {

        const nextStateLookups = [
            {
                current: BattleStepState.PreAction1,
                next: BattleStepState.Action1
            },
            {
                current: BattleStepState.Action1,
                next: BattleStepState.PostAction1
            },
            {
                current: BattleStepState.PostAction1,
                next: BattleStepState.PreAction2
            },
            {
                current: BattleStepState.PreAction2,
                next: BattleStepState.Action2
            },
            {
                current: BattleStepState.Action2,
                next: BattleStepState.PostAction2
            },
            {
                current: BattleStepState.PostAction2,
                next: BattleStepState.BeforeEnd
            },
            {
                current: BattleStepState.BeforeEnd,
                next: BattleStepState.End
            },
            {
                current: BattleStepState.End,
                next: undefined
            }
        ];

        //this needs to be cached.
        const actionOrder = this.GetMoveOrder();

        while (this.currentState.type !== 'awaiting-switch-action' && this.currentState.type !== 'turn-finished' && this.currentState.type !== 'game-over') {

            var startStep = nextStateLookups.find((e) => {
                return e.current === this.currentBattleStep
            });

            if (startStep === undefined) {
                throw new Error("Could not find proper battle step state");
            }

            //figure out if player 1 or player 2 is action 1 or action 2
            let pokemonAtStart1 = undefined;
            let pokemonAtStart2 = undefined;

            //get the proper starting pokeon based on the action order.

            if (actionOrder[0].playerId === this.players[0].id) {
                pokemonAtStart1 = this._activePokemonIdAtStart1;
                pokemonAtStart2 = this._activePokemonIdAtStart2;
            }
            else {
                pokemonAtStart1 = this._activePokemonIdAtStart2;
                pokemonAtStart2 = this._activePokemonIdAtStart1;
            }

            //get the propert current pokemon based on the action order
            const currentPokemon1 = this.GetActivePokemon(actionOrder[0].playerId);
            const currentPokemon2 = this.GetActivePokemon(actionOrder[1].playerId);

            switch (startStep.current) {
                case BattleStepState.PreAction1: {
                    //don't need to check here because it should be fine.
                    //TODO: need to store some sort of value to see if the pokemon is able to attack or not.
                    if (actionOrder[0].type !== 'use-move-action') {
                        break;
                    }
                    this.BeforeAttack(currentPokemon1);
                    break;
                }
                case BattleStepState.Action1: {

                    if (actionOrder[0].type === 'use-move-action' && !currentPokemon1.canAttackThisTurn) {
                        break;
                    }
                    if (pokemonAtStart1 === currentPokemon1.id) {
                        this.DoAction(actionOrder[0]);
                    }
                    break;
                }
                case BattleStepState.PostAction1: {
                    if (actionOrder[0].type !== 'use-move-action') {
                        break;
                    }
                    if (pokemonAtStart1 === currentPokemon1.id) {
                        this.AfterAttack(currentPokemon1)
                    }
                    break;
                }
                case BattleStepState.PreAction2: {
                    if (actionOrder[1].type !== 'use-move-action') {
                        break;
                    }
                    if (pokemonAtStart2 === currentPokemon2.id) {
                        this.BeforeAttack(currentPokemon2);
                    }
                    break;
                }
                case BattleStepState.Action2: {
                    if (actionOrder[1].type === 'use-move-action' && !currentPokemon2.canAttackThisTurn) {
                        break;
                    }
                    if (pokemonAtStart2 === currentPokemon2.id) {
                        this.DoAction(actionOrder[1]);
                    }
                    break;
                }
                case BattleStepState.PostAction2: {
                    if (actionOrder[1].type !== 'use-move-action') {
                        break;
                    }
                    if (pokemonAtStart2 === currentPokemon2.id) {
                        this.AfterAttack(currentPokemon2)
                    }
                    break;
                }
                case BattleStepState.BeforeEnd: {
                    this.BeforeEndOfTurn();
                    break;
                }
                case BattleStepState.End: {
                    this.EndTurn();
                    break;
                }
                default: {
                    throw new Error('No valid battle step state found for calculate turn');
                }
            }

            //go to the next state
            if (startStep.next !== undefined) {
                this.currentBattleStep = startStep.next;
            }
        }
    }

    private SwitchPokemon(playerId: number, pokemonInId: number) {
        //not yet implemented, just for practice.
        const player = this.players.find(p => p.id === playerId);
        const pokemon = player?.pokemon.find(p => p.id === pokemonInId);
        const switchOutPokemonId = player?.currentPokemonId;


        if (player === undefined || pokemon === undefined) {
            console.error('error in switching pokemon');
            //should never get to this point?
            return;
        }
        //current pokemon position is 0
        //find the pokemon to switch in position
        const switchInPokemonPos = player.pokemon.indexOf(player.pokemon.find(p => p.id === pokemonInId)!);
        let pokemonArrCopy = player.pokemon.slice();

        //i don't think we actualy want to switch the pokemon position anymore?
        pokemonArrCopy[0] = player.pokemon[switchInPokemonPos];
        pokemonArrCopy[switchInPokemonPos] = player.pokemon[0];

        player.pokemon = pokemonArrCopy;
        player.currentPokemonId = pokemonArrCopy[0].id;

        const switchOutEffect: SwitchOutEvent = {
            type: BattleEventType.SwitchOut,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonInId,
        }
        this.AddEvent(switchOutEffect);
        const switchInEffect: SwitchInEvent = {
            type: BattleEventType.SwitchIn,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonInId,
        }
        this.AddEvent(switchInEffect);
    }

    private UseItem(playerId: number, itemId: number) {
        const player = this.GetPlayer(playerId);
        const item = player?.items.find(item => item.id === itemId);

        if (item === undefined) {
            console.error("could not find item to use for use item");
            return;
        }

        const pokemon = this.GetActivePokemon(playerId);

        if (pokemon === undefined) {
            console.error("could not find pokemon to use for use item");
            return;
        }

        const useItemEffect: UseItemEvent = {
            type: BattleEventType.UseItem,
            itemName: item.name,
            itemId: item.id,
            targetPokemonId: pokemon.id
        }
        this.AddEvent(useItemEffect);

        item.effects.forEach(effect => {
            if (effect.type === 'health-restore') {
                const itemHealAmount = effect.amount;
                const healing = Math.min(pokemon.originalStats.health - pokemon.currentStats.health, itemHealAmount);
                pokemon.currentStats.health = Math.min(pokemon.originalStats.health, pokemon.currentStats.health + itemHealAmount);
                let itemEffect: HealEvent = {
                    type: BattleEventType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth: pokemon.currentStats.health,
                    totalHealing: healing,
                }
                this.AddEvent(itemEffect);
            }
        });

        item.quantity -= 1;
        //remove item from inventory.
        if (item.quantity <= 0) {
            const itemIndex = player.items.indexOf(item);
            player.items.splice(itemIndex, 1);
        }
    }

    private UseTechnique(playerId: number, pokemonId: number, techniqueId: number) {

        const player = this.GetPlayer(playerId);
        const pokemon = this.GetPokemon(pokemonId);
        const move = pokemon.techniques.find(t => t.id === techniqueId);

        //This should work as long as it stays 1v1;

        const defendingPlayer = this.players.find(p => p !== player);
        if (defendingPlayer === undefined) {
            throw new Error(`Could not find defending player`);
        }

        const defendingPokemon = this.GetPokemon(defendingPlayer.currentPokemonId);

        if (move === undefined) {
            throw new Error(`Error in using technique, could not find technique with id ${techniqueId} `);
        }
        const useMoveEffect: UseMoveEvent = {
            type: BattleEventType.UseMove,
            userId: pokemon.id,
            targetId: defendingPokemon.id,
            didMoveHit: true,
            moveName: move.name,
        }
        this.AddEvent(useMoveEffect);

        if (!this.Roll(move.chance)) {
            useMoveEffect.didMoveHit = false;
            return;
        }

        if (move.damageType === 'physical' || move.damageType === 'special') {
            //this method was extracted by using "extract method" and needs to be refactored. we should probably just return a partial event log.
            this.DoDamageMove(pokemon, defendingPokemon, move);
            /*
                On Frozen Pokemon Damaged by Fire Move
                    -UNTHAW THE POKEMON
            */
            if (move.elementalType === ElementType.Fire && defendingPokemon.status === Status.Frozen) {
                defendingPokemon.status = Status.None;
                const thawEffect: StatusChangeEvent = {
                    type: BattleEventType.StatusChange,
                    status: Status.None,
                    targetPokemonId: defendingPokemon.id,
                    attackerPokemonId: pokemon.id,
                    defaultMessage: `${defendingPokemon.name} is not frozen anymore!`
                }
                this.AddEvent(thawEffect);
            }

            this.ApplyMoveEffects(move, pokemon, defendingPokemon);
        }
        else {
            this.DoStatusMove(move, defendingPokemon, pokemon);
        }

    }

    private DoStatusMove(move: Technique, defendingPokemon: Pokemon, pokemon: Pokemon) {
        this.ApplyMoveEffects(move, pokemon, defendingPokemon);
    }

    private ApplyMoveEffects(move: Technique, pokemon: Pokemon, defendingPokemon: Pokemon): void {
        if (!move.effects) {
            return;
        }

        move.effects.forEach((effect) => {
            if (this.Roll(effect.chance)) {
                if (effect.type === 'inflict-status') {

                    const targetPokemon = effect.target === 'ally' ? pokemon : defendingPokemon;

                    //cannot apply a status to a pokemon that has one, and cannot apply a status to a fainted pokemon.
                    if (targetPokemon.status !== Status.None || targetPokemon.currentStats.health === 0) {
                        return;
                    }

                    //Cannot inflict paralyze status on electric type pokemon.
                    if (effect.status === Status.Paralyzed && !GetHardStatus(Status.Paralyzed).CanApply(this,defendingPokemon)){
                        return;
                    }
                    //Cannot inflict status on fire type pokemon
                    if (effect.status === Status.Burned && HasElementType(defendingPokemon, ElementType.Fire)) {
                        return;
                    }
                    //Cannot inflict frozen status on ice type pokemon
                    if (effect.status === Status.Frozen && HasElementType(defendingPokemon, ElementType.Ice)) {
                        return;
                    }
                    if (effect.status === Status.Poison && HasElementType(defendingPokemon, ElementType.Poison)) {
                        return;
                    }

                    targetPokemon.status = effect.status;

                    const statusInflictedEffect: StatusChangeEvent = {
                        type: BattleEventType.StatusChange,
                        status: effect.status,
                        attackerPokemonId: pokemon.id,
                        targetPokemonId: targetPokemon.id
                    };
                    this.AddEvent(statusInflictedEffect);
                }
            }
        });
    }

    private DoDamageMove(pokemon: Pokemon, defendingPokemon: Pokemon, move: Technique) {
        const baseDamage = GetBaseDamage(pokemon, defendingPokemon, move);
        const damageModifierInfo = GetDamageModifier(pokemon, defendingPokemon, move);
        const totalDamage = Math.ceil(baseDamage * damageModifierInfo.modValue);
        this.ApplyDamage(defendingPokemon, totalDamage, damageModifierInfo);
    }

    private EndTurn() {
        this.currentState = {
            type: 'turn-finished'
        }
    }
    //move this out
    public Roll(chance: number): boolean {
        const randomChance = this.GetRandomChance();
        if (chance >= 100) {
            return true;
        }
        return chance >= randomChance;
    }

    /*
        PRIVATE INTERNAL METHODS
    */
    private GetRandomChance(): number {
        return Math.round(Math.random() * 100);
    }
    public AddEvent(effect: BattleEvent) {
        effect.id = this.eventNum++;
        this.turnLog.push(effect);
    }
    //Sees if you a random chance is successful

    private GetPlayer(playerId: number): Player {
        const player = this.players.find(player => player.id === playerId);
        if (player === undefined) {
            throw new Error(`Could not find player with id ${playerId} `);
        }
        return player;
    }
    private GetPokemon(pokemonId: number): Pokemon {
        const pokemon = this.players.map(player => { return player.pokemon }).flat().find(pokemon => pokemon.id === pokemonId);
        if (pokemon === undefined) {
            throw new Error(`Could not find pokemon with id ${pokemonId} `);
        }
        return pokemon;
    }

    private GetActivePokemon(playerId: number): Pokemon {
        const player = this.GetPlayer(playerId);
        const activePokemon = player.pokemon.find(poke => poke.id === player.currentPokemonId);
        if (activePokemon === undefined) {
            throw new Error(`Could not find active pokemon for player with id ${playerId} `)
        }
        return activePokemon;
    }
    private GetPokemonOwner(pokemon: Pokemon) {
        const owner = this.players.filter(player => {
            return player.pokemon.find(poke => poke.id === pokemon.id) !== undefined
        })[0];

        if (owner === undefined) {
            throw Error(`Could not find owner for pokemon ${pokemon.id + ':' + pokemon.name}`)
        }

        return owner;
    }

    private AutoAssignPokemonIds(): void {
        this.players.flat().map(player => {
            return player.pokemon
        }).flat().forEach(pokemon => {
            //quick hack here to see if the id for these entities has already been set, this pattern is repeated in the auto assign item ids and auto assign current pokemon ids functions as well.
            if (pokemon.id === -1) {
                pokemon.id = this.pokemonIdCount++
            }
        });
    }

    private AutoAssignItemIds(): void {
        this.players.flat().map(player => {
            return player.items
        }).flat().forEach(item => {
            if (item.id === -1) {
                item.id = this.itemIdCount++;
            }
        });
    }

    private AutoAssignCurrentPokemonIds(): void {
        if (this.players[0].currentPokemonId === -1) {
            this.players[0].currentPokemonId = this.players[0].pokemon[0].id;
        }
        if (this.players[1].currentPokemonId === -1) {
            this.players[1].currentPokemonId = this.players[1].pokemon[0].id;
        }
    }

    //this needs to be cached due to potential randomness
    private GetMoveOrder(): Array<BattleAction> {

        if (this._moveOrder.length === 0) {
            this._moveOrder = GetMoveOrder(this.players, this.initialActions)
        }
        return this._moveOrder;

    }


};
