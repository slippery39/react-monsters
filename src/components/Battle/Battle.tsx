import React, { useState, useEffect, useCallback, useReducer } from 'react';


import BattleService, { OnNewTurnLogArgs } from "../../game/BattleService";
import { Player, Pokemon, ElementType, Technique } from '../../game/interfaces';
import { EffectType, SwitchPokemonAction, BattleEvent } from "../../game/BattleController";
import BattleMenu from "../battlemenu/BattleMenu";
import BattlePokemonDisplay, { OwnerType } from "../BattlePokemonDisplay/BattlePokemonDisplay";
import ItemMenu from "../ItemMenu/ItemMenu";
import AttackMenuNew from "../AttackMenuNew/AttackMenuNew";
import './Battle.css';
import Message from "../Message/Message";
import PokemonSwitchScreen from "../PokemonSwitchScreen/PokemonSwitchScreen";
import ElementIcon from "../ElementIcon/ElementIcon";

import Pokeball from "../Pokeball/Pokeball"

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

enum MenuState {
    None = 'none',
    MainMenu = 'main=menu',
    AttackMenu = 'attack-menu',
    ItemMenu = 'item-menu',
    SwitchMenu = 'switch-menu'
}

type State = {
    players: Array<Player>,
}

type Action = {
    type: 'status-change' | 'switch-in' | 'switch-out' | 'health-change' | 'state-change'
    id: number,
    targetId?: number | undefined,
    newHealth?: number | undefined
    newState?: Array<Player>
}

let battleService = new BattleService();

const initialState: State = {
    players: battleService.GetPlayers()
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
        //for syncing the state with the server.
        case 'state-change': {
            return { players: action.newState! };
        }
        case 'health-change': {
            const pokemonData = getPokemonAndOwner(newState, action.id);
            if (pokemonData.owner === undefined || pokemonData.pokemon === undefined) {
                console.error('Could not find proper pokemon in call to getPokemonAndOwner()');
                return state;
            }
            if (action.newHealth === undefined) {
                console.error('new health is needed for health change event');
                return state;
            }
            pokemonData.pokemon.currentStats.health = action.newHealth;
            return newState;
        }
        case 'switch-in': {
            const pokemonData = getPokemonAndOwner(newState, action.id);
            if (pokemonData.owner) {
                pokemonData.owner.currentPokemonId = action.id;

            }
            return newState;
        }
        case 'switch-out': {
            const pokemonData = getPokemonAndOwner(newState, action.id);
            if (pokemonData.owner) {
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
let turnLog: OnNewTurnLogArgs | undefined = undefined;

function Battle() {

    const [menuState, setMenuState] = useState(MenuState.MainMenu);

    const [eventIndex, setEventIndex] = useState(0);
    const [effectIndex, setEffectIndex] = useState(0);

    const [currentEventState, setCurrentEventState] = useState(BattleEventUIState.None);
    const [state, dispatch] = useReducer(reducer, initialState);


    battleService.OnNewTurnLog = (args: OnNewTurnLogArgs) => {
        setEventIndex(0);
        setEffectIndex(0);
        turnLog = args;
        setCurrentEventState(BattleEventUIState.ShowingEventMessage);
        setMenuState(MenuState.None);
    };

    function getAllyPokemon(): Pokemon {
        const pokemon = state.players[0].pokemon.find(p => {
            return p.id === state.players[0].currentPokemonId
        });
        if (pokemon === undefined) {
            //something is wrong;
            /*
            console.error('cannot find ally pokemon');
            console.error('id was ' + state.players[0].currentPokemonId);
            console.error(state.players[0]);
            */

        }
        const nullPokemon: Pokemon = {
            id: -1,
            name: '',
            originalStats: {
                health: 0,
                attack: 0,
                specialAttack: 0,
                defence: 0,
                specialDefence: 0,
                speed: 0
            },
            currentStats: {
                health: 0,
                attack: 0,
                specialAttack: 0,
                defence: 0,
                specialDefence: 0,
                speed: 0
            },
            techniques: [],
            elementalTypes: [ElementType.Normal]
        }
        return pokemon || nullPokemon;

    }
    function getEnemyPokemon(): Pokemon {
        const pokemon = state.players[1].pokemon.find(p => {
            return p.id === state.players[1].currentPokemonId
        });
        if (pokemon === undefined) {
            console.error('cannot find ally pokemon with id ' + state.players[1].currentPokemonId);
        }
        const nullPokemon: Pokemon = {
            id: -1,
            name: 'NULLMON',
            originalStats: {
                health: 0,
                attack: 0,
                specialAttack: 0,
                defence: 0,
                specialDefence: 0,
                speed: 0
            },
            currentStats: {
                health: 0,
                attack: 0,
                specialAttack: 0,
                defence: 0,
                specialDefence: 0,
                speed: 0
            },
            elementalTypes: [ElementType.Fire],
            techniques: [],
        }
        return pokemon || nullPokemon;
    }

    //our simple state machine for our events log.
    const nextEvent = useCallback(() => {


        if (turnLog === undefined) {
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

        const currentEvent = turnLog?.currentTurnLog[eventIndex];
        const nextEvent = turnLog?.currentTurnLog[eventIndex + 1];
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

                //BUG - FOR SOME REASON THIS WAS UPDATING TWICE when we switched.. causing it to jump by 2 and us having an undefined event errror. 
                //No clue why, this fixes it by clamping it so it never goes past the max length;
                setEventIndex(e => { return Math.min(turnLog!.currentTurnLog.length - 1, e + 1) });

                setCurrentEventState(BattleEventUIState.ShowingEventMessage);
                console.log('are we reaching the end of next event here?')
            }
            else { //turn is complete.

                //must be awaiting switch action, and the person awaiting the switch action must the player.
                if (turnLog.currentTurnState === 'awaiting-switch-action') {
                    setMenuState(MenuState.SwitchMenu);
                }
                else {
                    //turn has finished, reset to main menu.

                    setEffectIndex(0);
                    setEventIndex(0);
                    setCurrentEventState(BattleEventUIState.None);
                    setMenuState(MenuState.MainMenu);
                    dispatch({
                        id: 0,
                        type: 'state-change',
                        newState: turnLog.newState
                    })
                }


            }
        }


    }, [currentEventState, eventIndex, effectIndex]);


    useEffect(() => {

        if (turnLog === undefined) {
            return;
        }


        const currentEvent = turnLog!.currentTurnLog[eventIndex];

        //skip messages that are blank.
        if (currentEventState === BattleEventUIState.ShowingEventMessage && currentEvent.message === '') {
            nextEvent();
        }

        if (currentEventState === BattleEventUIState.ShowingEffectAnimation) {
            const currentEvent = turnLog!.currentTurnLog[eventIndex];
            const currentEffect = currentEvent.effects[effectIndex];



            if (currentEffect.type === EffectType.Damage || currentEffect.type === EffectType.Heal) {
                const pokemonId = currentEffect.targetPokemonId
                const targetHealth = currentEffect.targetFinalHealth;
                dispatch({
                    type: 'health-change',
                    id: pokemonId,
                    newHealth: targetHealth
                });
                //the next event is controlled by a callback in the healthbar.

            }
            else if (currentEffect.type === EffectType.SwitchOut) {
                //for now lets apply no animations.
                dispatch({
                    type: 'switch-out',
                    id: currentEffect.switchOutPokemonId
                })
                nextEvent()
            }
            else if (currentEffect.type === EffectType.SwitchIn) {
                dispatch({
                    type: 'switch-in',
                    id: currentEffect.switchInPokemonId
                })
                nextEvent()
            }
            else {
                nextEvent();
            }
        }
    }, [currentEventState, eventIndex, effectIndex, nextEvent]);

    function SetBattleAction(technique: Technique) {
        battleService.SetPlayerAction({
            playerId: 1, //todo : get player id
            pokemonId: state.players[0].currentPokemonId, //todo: get proper pokemon id
            moveId: technique.id, //todo: get technique id
            type: 'use-move-action'
        });
    }
    function SetSwitchAction(pokemonSwitchId: number) {
        const action: SwitchPokemonAction = {
            type: 'switch-pokemon-action',
            playerId: 1, //todo : get proper player id.
            switchPokemonId: pokemonSwitchId
        }
        battleService.SetPlayerAction(action);
    }


    function MakeElementIcons() {

        var icons = [];
        for (let element in ElementType) {
            //var myElement: ElementType = ElementType[element as keyof typeof ElementType];
            var myElement: ElementType = ElementType[element as keyof typeof ElementType];
            icons.push((<ElementIcon element={myElement} />))
        }

        return (<div>{icons}</div>);

    }


    //props.pokemon.currentStats.health / props.pokemon.originalStats.health) * 100
    return (
        <div className="App">
            <div className="debug">
                <b>DEBUG INFO</b>
                <div>Current Event State : {currentEventState} </div>
                <div>Current Menu State : {menuState} </div>
                <div> Current Event Index : {eventIndex} </div>
                <div> Current Effect Index : {effectIndex}</div>
                <div>Turn ID : {battleService.GetCurrentTurn().id} </div>
                <div>Turn State : {battleService.GetCurrentTurn().currentState.type} </div>
                {MakeElementIcons()}
            </div>
            <PokemonSwitchScreen player={state.players[0]} />
            <div className="battle-window">
                <div className="top-screen">
                <div className='battle-terrain'>
                    {getEnemyPokemon().id !== -1 && <BattlePokemonDisplay onHealthAnimateComplete={() => nextEvent()} owner={OwnerType.Enemy} pokemon={getEnemyPokemon()} />}
                    {getAllyPokemon().id !== -1 && <BattlePokemonDisplay onHealthAnimateComplete={() => nextEvent()} owner={OwnerType.Ally} pokemon={getAllyPokemon()} />}
                </div>
                <div style={{ height: "75px",border:"5px solid black", textAlign:"left" }}>
                    {currentEventState === BattleEventUIState.None && <Message message={`What will ${getAllyPokemon().name} do?`}/>}
                    {(currentEventState === BattleEventUIState.ShowingEventMessage || currentEventState === BattleEventUIState.ShowingEffectAnimation) &&
                        <Message
                            message={turnLog!.currentTurnLog[eventIndex].message}
                            onFinish={function () { nextEvent() }} />}
                    {currentEventState === BattleEventUIState.ShowingEffectMessage &&
                        <Message
                            message={turnLog!.currentTurnLog[eventIndex].effects[effectIndex].message}
                            onFinish={function () { nextEvent() }} />}
                </div>
                </div>
                <div className="bottom-screen">
                    {menuState ===MenuState.MainMenu && <div className="pokemon-party-pokeballs">{state.players[0].pokemon.map(p=>(<span style={{width:"30px",marginRight:"10px"}}><Pokeball/></span>))}</div>}
                    {menuState ===MenuState.MainMenu &&
                        <BattleMenu
                            onMenuAttackClick={(evt) => { setMenuState(MenuState.AttackMenu) }}
                            onMenuItemClick={(evt) => { setMenuState(MenuState.ItemMenu) }}
                            onMenuSwitchClick={(evt) => { setMenuState(MenuState.SwitchMenu) }} />}
                    {menuState === MenuState.AttackMenu && <AttackMenuNew onCancelClick={() => setMenuState(MenuState.MainMenu)} onAttackClick={(tech: any) => { SetBattleAction(tech); }} techniques={getAllyPokemon().techniques} />}
                    {menuState === MenuState.ItemMenu && <ItemMenu onItemClick={(item: any) => { }} items={state.players[0].items} />}
                    {menuState === MenuState.SwitchMenu && <PokemonSwitchScreen onCancelClick={() => setMenuState(MenuState.MainMenu)}  onPokemonClick={(pokemon) => { SetSwitchAction(pokemon.id); }} player={state.players[0]} />
                    }
                </div>
            </div>
        </div >
    );
}

export default Battle;
