import React, { useState, useEffect, useCallback, useReducer } from 'react';

import { Player, Status, Pokemon, ElementType, Technique } from '../../game/interfaces';
import {getTurnLog, EffectType,GetPlayers,SetPlayerAction,UseMoveAction } from "../../game/BattleController";
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
    players:GetPlayers()    
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

//Right here, this needs to happen dynamically, not right away.
let turnLog = getTurnLog();

function Battle() {

    const [menuState, setMenuState] = useState('main-menu');

    const [eventIndex, setEventIndex] = useState(0);
    const [effectIndex, setEffectIndex] = useState(0);

    const [currentEventState, setCurrentEventState] = useState(BattleEventUIState.None);
    const [state, dispatch] = useReducer(reducer, initialState);

    //TODO - wait for a turn log to be generated.
    
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

        if (turnLog === undefined){
            return;
        }

        //The logic is like this:
        //So we should have these states: 'showing-event-message, showing-effect-animation showing-effect-message'?
        //repeat until there are no more events
        //show the event message

        //repeat until there are no more effects
        //show the effect animation,
        //show the effect message,
        //

        const currentEvent = turnLog.events[eventIndex];
        const nextEvent = turnLog.events[eventIndex + 1];
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

        if (turnLog === undefined){
            return;
        }
        const currentEvent = turnLog!.events[eventIndex];

        //skip messages that are blank.
        if (currentEventState === BattleEventUIState.ShowingEventMessage && currentEvent.message === '') {
            nextEvent();
        }

        if (currentEventState === BattleEventUIState.ShowingEffectAnimation) {
            const currentEvent = turnLog!.events[eventIndex];
            const currentEffect = currentEvent.effects[effectIndex];

            const pokemonId = currentEffect.targetId;
            const pokemon = getPokemonAndOwner(state, pokemonId).pokemon;
            if (pokemon === undefined) {
                console.error('error could not find pokemon with id :' + pokemonId)
                return;
            }
            if (currentEffect.type === EffectType.Damage) {
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

    function SetBattleAction(technique:Technique){
        console.log('checking if this ran twice "set battle action');
        console.log(technique);
        SetPlayerAction({
             playerId:1, //todo : get player id
             pokemonId:1, //todo: get proper pokemon id
             moveId:technique.id, //todo: get technique id
             type:'use-move-action'
        });
        turnLog =  getTurnLog();
        setCurrentEventState(BattleEventUIState.ShowingEventMessage);
        setMenuState('none');
    }

    return (
        <div className="App">
            <div>Current Event State : {currentEventState} </div>
            <div>Current Menu State : {menuState} </div>
            {getEnemyPokemon().id!==-1&& <BattlePokemonDisplay owner={OwnerType.Enemy} pokemon={getEnemyPokemon()} />}
            {getAllyPokemon().id!==-1 && <BattlePokemonDisplay owner={OwnerType.Ally}  pokemon={getAllyPokemon()} />}
            {(currentEventState === BattleEventUIState.ShowingEventMessage || currentEventState === BattleEventUIState.ShowingEffectAnimation) &&
                <Message
                    message={turnLog!.events[eventIndex].message}
                    onFinish={function () { nextEvent() }} />}
            {currentEventState === BattleEventUIState.ShowingEffectMessage &&
                <Message
                    message={turnLog!.events[eventIndex].effects[effectIndex].message}
                    onFinish={function () { nextEvent() }} />}
            {menuState === 'main-menu' &&
                <BattleMenu
                    onMenuAttackClick={(evt) => { setMenuState('attack-menu') }}
                    onMenuItemClick={(evt) => { setMenuState('item-menu') }}
                    onMenuSwitchClick={(evt) => { setMenuState('switch-menu') }} />}
            {menuState === 'attack-menu' && <AttackMenu onAttackClick={(tech: any) => { console.log('checking if this has ran twice');SetBattleAction(tech); }} techniques={getAllyPokemon().techniques} />}
            {menuState === 'item-menu' && <ItemMenu onItemClick={(item: any) => { console.log(item) }} items={state.players[0].items} />}
        </div>
    );
}

export default Battle;
