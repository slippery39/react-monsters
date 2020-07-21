import React, { useState, useEffect, useCallback, useReducer } from 'react';

import { Player, Status, Pokemon, ElementType } from '../../game/interfaces';
import { createCharizard, createVenusaur, createBlastoise } from "../../game/premadePokemon";
import {getTurnLog, EffectType } from "../../game/BattleController";
import BattleMenu from "../battlemenu/BattleMenu";
import BattlePokemonDisplay, { OwnerType } from "../BattlePokemonDisplay/BattlePokemonDisplay";
import ItemMenu from "../ItemMenu/ItemMenu";
import AttackMenu from "../AttackMenu/AttackMenu";

import Message from "../Message/Message";

import _ from "lodash"; //for deep cloning purposes to make our functions pure.

/*
For now we are using this app component to test out and fiddle with our ui components.
*/
enum BattleEventUIState {
    ShowingEventMessage = 'showing-event-message',
    ShowingEffectAnimation = 'showing-effect-animation',
    ShowingEffectMessage = 'showing-effect-message',
    None = 'none'
}

type State = {
    players: Array<Player>,
    allySwitchOut: Boolean
}

type Action = {
    type: 'health-tick-down' | 'health-tick-up' | 'status-change' | 'switch-in' | 'switch-out'
    id: number,
    targetId?: number | undefined
}

const initialState: State = {
    allySwitchOut: false,
    players:  [
        {
            id:1,
            name: 'Player 1',
            currentPokemonId: 1,
            pokemon: [
                createCharizard(1),
                createVenusaur(2),
                createBlastoise(3),
            ],
            items: [{ id: 1, name: 'potion', description: 'heals 30 health', quantity: 99 },
            { id: 2, name: 'antidote', description: 'cures poison', quantity: 99 }
            ]
        },
        {
            id:2,
            name: 'Player 2',
            currentPokemonId: 4,
            pokemon: [
                createBlastoise(4),
                createCharizard(5),
                createVenusaur(6),
            ],
            items: [{ id: 1, name: 'potion', description: 'heals 30 health', quantity: 99 },
            { id: 2, name: 'antidote', description: 'cures poison', quantity: 99 }
            ]
        }
    ]
}

const getPokemonAndOwner = function (state: State, pokemonId: number): { owner: Player | undefined, pokemon: Pokemon | undefined } {
    let pokemon;
    const pokemonOwner = state.players.find(p => {
        return p.pokemon.find(p => {
            if (p.id === pokemonId) {
                pokemon = p;
            }
            return p.id === pokemonId;
        });
    });
    return { owner: pokemonOwner, pokemon: pokemon }
}

const reducer = function (state = initialState, action: Action): State {

    //making a deep copy of the state object for immutable purposes.
    //this is the easiest way to get it working, but if our state object gets huge
    //then we may run into performance issues. but for now it works fine.
    var newState = _.cloneDeep(state);
    switch (action.type) {
        case 'health-tick-down': {
            const pokemonData = getPokemonAndOwner(newState, action.id);
            if (pokemonData.owner === undefined || pokemonData.pokemon === undefined) {
                console.error('Could not find proper pokemon in call to getPokemonAndOwner()');
                return state;
            }
            //since we are using lodash we can mutate our state!
            pokemonData.pokemon.currentStats.health -= 1;
            return newState;
        }
        case 'health-tick-up': {
            const pokemonData = getPokemonAndOwner(newState, action.id);
            if (pokemonData.owner === undefined || pokemonData.pokemon === undefined) {
                console.error('Could not find proper pokemon in call to getPokemonAndOwner()');
                return state;
            }
            //since we are using lodash we can mutate our state!
            pokemonData.pokemon.currentStats.health += 1;
            return newState;
        }
        case 'switch-in': {
            const pokemonData = getPokemonAndOwner(newState, action.id);
            console.log(action);
            if (pokemonData.owner) {
                if (action.targetId) {
                    pokemonData.owner.currentPokemonId = action.targetId;
                }
            }
            //need to be able to switch here.
            newState.allySwitchOut = false;
            return newState;
        }
        case 'switch-out': {
            const pokemonData = getPokemonAndOwner(newState,action.id);
            if (pokemonData.owner){
                pokemonData.owner.currentPokemonId = -1;
            }
            /*
            For now, remove the pokemon
            */
            return newState;
        }
        default: {
            throw new Error();
        }
    }
}

const battleState = getTurnLog();

function Battle() {

    const [menuState, setMenuState] = useState('showing-turn');

    const [eventIndex, setEventIndex] = useState(0);
    const [effectIndex, setEffectIndex] = useState(0);

    const [currentEventState, setCurrentEventState] = useState(BattleEventUIState.ShowingEventMessage);
    const [state, dispatch] = useReducer(reducer, initialState);

    function getAllyPokemon() : Pokemon {
        const pokemon =  state.players[0].pokemon.find(p=>{
            return p.id === state.players[0].currentPokemonId
        });
        if (pokemon === undefined){
            //something is wrong;
            console.error('cannot find ally pokemon');            
        }
        const nullPokemon : Pokemon = {
            id:-1,
            name:'', 
            originalStats:{
                health:0,
                attack:0,
                specialAttack:0,
                defence:0,
                specialDefence:0,
                speed:0                
            },
            currentStats:{
                health:0,
                attack:0,
                specialAttack:0,
                defence:0,
                specialDefence:0,
                speed:0                
            },
            techniques:[],
            elementalTypes:[ElementType.Normal]
        }
        return pokemon || nullPokemon ;

    }
    function getEnemyPokemon() : Pokemon {
        const pokemon =  state.players[1].pokemon.find(p=>{
            return p.id === state.players[1].currentPokemonId
        });
        if (pokemon === undefined){
            console.error('cannot find ally pokemon with id ' + state.players[1].currentPokemonId);
        }
        const nullPokemon : Pokemon = {
            id:-1,
            name:'NULLMON', 
            originalStats:{
                health:0,
                attack:0,
                specialAttack:0,
                defence:0,
                specialDefence:0,
                speed:0                
            },
            currentStats:{
                health:0,
                attack:0,
                specialAttack:0,
                defence:0,
                specialDefence:0,
                speed:0                
            },
            elementalTypes:[ElementType.Fire],
            techniques:[],
        }
        return pokemon || nullPokemon;
    }

    //our simple state machine for our events log.
    const nextEvent = useCallback(() => {

        //The logic is like this:
        //So we should have these states: 'showing-event-message, showing-effect-animation showing-effect-message'?
        //repeat until there are no more events
        //show the event message

        //repeat until there are no more effects
        //show the effect animation,
        //show the effect message,
        //

        const currentEvent = battleState.events[eventIndex];
        const nextEvent = battleState.events[eventIndex + 1];
        const isNextEvent = nextEvent !== undefined;

        const nextEffect = currentEvent.effects[effectIndex + 1];
        const isNextEffect = nextEffect !== undefined;

        if (currentEventState === BattleEventUIState.ShowingEventMessage) {
            setCurrentEventState(BattleEventUIState.ShowingEffectAnimation);
        }
        else if (currentEventState === BattleEventUIState.ShowingEffectAnimation) {
            setCurrentEventState(BattleEventUIState.ShowingEffectMessage);
        }
        else if (currentEventState === BattleEventUIState.ShowingEffectMessage) {
            //if there are more effects show them,
            //otherwise if there are more events show them,
            //otherwise stop
            if (isNextEffect) {
                setEffectIndex(e => e + 1);
                setCurrentEventState(BattleEventUIState.ShowingEffectAnimation);
            }
            else if (isNextEvent) {
                setEffectIndex(0);
                setEventIndex(e => e + 1);
                setCurrentEventState(BattleEventUIState.ShowingEventMessage);
            }
            else {
                setEffectIndex(0);
                setEventIndex(0);
                setCurrentEventState(BattleEventUIState.None);
                setMenuState('main-menu');
            }
        }

    }, [currentEventState, eventIndex, effectIndex]);


    useEffect(() => {
        const currentEvent = battleState.events[eventIndex];

        //skip messages that are blank.
        if (currentEventState === BattleEventUIState.ShowingEventMessage && currentEvent.message === '') {
            nextEvent();
        }

        if (currentEventState === BattleEventUIState.ShowingEffectAnimation) {
            const currentEvent = battleState.events[eventIndex];
            const currentEffect = currentEvent.effects[effectIndex];

            const pokemonId = currentEffect.targetId;
            const pokemon = getPokemonAndOwner(state, pokemonId).pokemon;
            if (pokemon === undefined) {
                console.error('error could not find pokemon with id :' + pokemonId)
                return;
            }
            if (currentEffect.type === EffectType.Damage) {
                console.log(currentEffect);
                const timeForHealthChange = (1000 / (pokemon.currentStats.health) - currentEffect.targetFinalHealth);
                //if i want health changes to take a second.
                //then it needs to be (pokemon.currentStats.health - currentEffect.targetFinalHealth = deltaHealth);
                //1000/deltaHealth = intervals in seconds.

                //what if we instead define the health to take off every turn?
                //So if we update every 33 seconds, the health change per interval would have to be deltaHealth/33
                //the only thing here is that we might end up in fractional healths and would need to consider that.
                const healthChange = setInterval(() => {
                    if (pokemon.currentStats.health !== currentEffect.targetFinalHealth) {
                        dispatch({
                            type: 'health-tick-down',
                            id: pokemonId
                        })

                        //TOOD: a failsafe to make sure that if there any any weird values getting in here (i.e. decimal number or whatnot) that this still works 
                        //and does not end up ticking non stop.
                    }
                    else {
                        //pokemon.currentStats.health = currentEffect.targetFinalHealth;
                        nextEvent();
                        clearInterval(healthChange);
                    }
                }, timeForHealthChange);

                return () => clearInterval(healthChange);
            }
            else if (currentEffect.type === EffectType.Heal) {
                const timeForHealthChange = (1000 / (currentEffect.targetFinalHealth) - pokemon.currentStats.health);

                //i want the health change to be a constant time.
                const heal = setInterval(() => {
                    if (pokemon.currentStats.health !== currentEffect.targetFinalHealth) {
                        dispatch({
                            type: 'health-tick-up',
                            id: pokemonId
                        })
                    }
                    else {
                        //the interval is firing one extra time but i don't know why.
                        pokemon.currentStats.health = currentEffect.targetFinalHealth;
                        nextEvent();
                        clearInterval(heal);
                    }
                }, timeForHealthChange);

                return () => clearInterval(heal);
            }
            else if (currentEffect.type === EffectType.Poisoned) {
                //TODO: need to dispatch status changed 
                pokemon.status = Status.Poison;
                nextEvent();
            }
            else if (currentEffect.type === EffectType.SwitchOut) {
                //for now lets apply no animations.
                dispatch({
                    type: 'switch-out',
                    id: pokemonId
                })
                nextEvent()
            }
            else if (currentEffect.type === EffectType.SwitchIn) {
                dispatch({
                    type: 'switch-in',
                    id: pokemonId,
                    targetId:currentEffect.targetId
                })
                nextEvent()
            }
            else {
                nextEvent();
            }
        }
    }, [currentEventState, eventIndex, nextEvent, effectIndex, state]);

    return (
        <div className="App">
            <div>Current Event State : {currentEventState} </div>
            <div>Current Menu State : {menuState} </div>
            {getEnemyPokemon().id!==-1&& <BattlePokemonDisplay owner={OwnerType.Enemy} pokemon={getEnemyPokemon()} />}
            {getAllyPokemon().id!==-1 && <BattlePokemonDisplay owner={OwnerType.Ally}  pokemon={getAllyPokemon()} />}
            {(currentEventState === BattleEventUIState.ShowingEventMessage || currentEventState === BattleEventUIState.ShowingEffectAnimation) &&
                <Message
                    message={battleState.events[eventIndex].message}
                    onFinish={function () { nextEvent() }} />}
            {currentEventState === BattleEventUIState.ShowingEffectMessage &&
                <Message
                    message={battleState.events[eventIndex].effects[effectIndex].message}
                    onFinish={function () { nextEvent() }} />}
            {menuState === 'main-menu' &&
                <BattleMenu
                    onMenuAttackClick={(evt) => { setMenuState('attack-menu') }}
                    onMenuItemClick={(evt) => { setMenuState('item-menu') }}
                    onMenuSwitchClick={(evt) => { setMenuState('switch-menu') }} />}
            {menuState === 'attack-menu' && <AttackMenu onAttackClick={(tech: any) => { console.log(tech) }} techniques={getAllyPokemon().techniques} />}
            {menuState === 'item-menu' && <ItemMenu onItemClick={(item: any) => { console.log(item) }} items={state.players[0].items} />}
        </div>
    );
}

export default Battle;
