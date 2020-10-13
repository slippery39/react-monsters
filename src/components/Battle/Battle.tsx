import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';


import BattleService, { OnNewTurnLogArgs } from "../../game/BattleService";
import { Player, Pokemon, ElementType, Technique, Item } from '../../game/interfaces';
import { EffectType, SwitchPokemonAction, UseItemAction } from "../../game/BattleController";
import BattleMenu from "../battlemenu/BattleMenu";
import BattlePokemonDisplay, { OwnerType } from "../BattlePokemonDisplay/BattlePokemonDisplay";
import ItemMenu from "../ItemMenu/ItemMenu";
import AttackMenuNew from "../AttackMenuNew/AttackMenuNew";
import './Battle.css';
import Message from "../Message/Message";
import PokemonSwitchScreen from "../PokemonSwitchScreen/PokemonSwitchScreen";
import ElementIcon from "../ElementIcon/ElementIcon";

import Pokeball from "../Pokeball/Pokeball"

import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

import _ from "lodash"; //for deep cloning purposes to make our functions pure.

gsap.registerPlugin(TextPlugin);


enum MenuState {
    None = 'none',
    MainMenu = 'main=menu',
    AttackMenu = 'attack-menu',
    ItemMenu = 'item-menu',
    SwitchMenu = 'switch-menu',
    FaintedSwitchMenu = 'fainted-switch-menu',
    ShowingTurn = 'showing-turn'
}

type State = {
    players: Array<Player>,
}

type Action = {
    type: 'status-change' | 'switch-in' | 'switch-out' | 'health-change' | 'state-change' | 'use-technique'
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




function Battle() {




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

    const [menuState, setMenuState] = useState(MenuState.MainMenu);
    const [eventIndex, setEventIndex] = useState(0);
    const [turnLog,setTurnLog] = useState<OnNewTurnLogArgs|undefined>(undefined);
    

    const [runningAnimations, setRunningAnimations] = useState(false);

    const [state, dispatch] = useReducer(reducer, initialState);
    const [message,setMessage] = useState(`What will ${getAllyPokemon().name} do?`);

    //for animation purposes
    const allyPokemonImage = useRef(null);
    const enemyPokemonImage = useRef(null);
    const messageBox = useRef(null);

        /*
    animation testing
    */

    /*
   useEffect( ()=>{

    if (allyPokemonImage.current === undefined){
        return;
    }
    const timeline = gsap.timeline();

    //pokemon fainting animation
    timeline.to(allyPokemonImage.current,{opacity:"0",top:"+=100",duration:1});
});
*/


    battleService.OnNewTurnLog = (args: OnNewTurnLogArgs) => {
        setTurnLog(args);
        console.log(args);
        setEventIndex(0);
        setMenuState(MenuState.ShowingTurn);
    };


    function isAllyPokemon(id: number): boolean {
        return state.players[0].pokemon.filter(pokemon => pokemon.id === id).length > 0;
    }

    function getPokemonById(id: number): Pokemon {
        const pokemon = state.players.map(player => {
            return player.pokemon;
        }).flat().filter(pokemon => pokemon.id === id);

        return pokemon[0];
    }

    function getAllyPokemon(): Pokemon {
        const pokemon = state.players[0].pokemon.find(p => {
            return p.id === state.players[0].currentPokemonId
        });
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
    //TODO: when we are just using generic events, this will be simplified.
    const nextEvent = useCallback(() => {

        if (turnLog === undefined) {
            return;
        }
        const nextEvent = turnLog?.currentTurnLog[eventIndex + 1];
        const isNextEvent = nextEvent !== undefined;

        if (!isNextEvent) {
            setTurnLog(undefined);
            //must be awaiting switch action, and the person awaiting the switch action must the player.
            if (turnLog.currentTurnState === 'awaiting-switch-action') {
                setMenuState(MenuState.FaintedSwitchMenu);
            }
            else {
                setEventIndex(0);
                setMenuState(MenuState.MainMenu);
                dispatch({
                    id: 0,
                    type: 'state-change',
                    newState: turnLog.newState
                })
            }
        }
        setEventIndex(e => { return Math.min(turnLog!.currentTurnLog.length - 1, e + 1) });

    },[turnLog,eventIndex]);

    useEffect(() => {
        if (turnLog === undefined || menuState !== MenuState.ShowingTurn) {
            return;
        }

        const currentEvent = turnLog!.currentTurnLog[eventIndex];

        console.log(currentEvent)

        if (currentEvent === undefined) {
            return;
        }

        if (runningAnimations === true) {
            return;
        }

        //TODO:go through all the effects in the event and add them to the timeline one by one.
        const timeLine = gsap.timeline({ paused: true, onComplete: () => { console.log('is on complete going?'); setRunningAnimations(false);  nextEvent(); } });
        setRunningAnimations(true);

        currentEvent.effects.forEach(effect => {
            console.log(effect);
            //animations we still need to do:

            //pokemon switching out, -pokemon going to the left
            //pokemon switching in, -pokemon coming in from the right
            //pokemon fainting -pokemon dropping down past the battle window and maybe a quick fade


            //oopsies problem
            //we need the critical hit message to happen after the healthbar message

            switch (effect.type) {

                case EffectType.PokemonFainted:{
                    const pokemon = getPokemonById(effect.targetPokemonId);                                        
                    if (isAllyPokemon(pokemon.id)){
                        timeLine.to(allyPokemonImage.current,{delay:0.5,top:"+=100",opacity:0,duration:1})
                    }
                    else{
                        timeLine.to(enemyPokemonImage.current,{delay:0.5,top:"+=100",opacity:0,duration:1});
                    }
                    timeLine.fromTo(messageBox.current, { text: "" }, {
                        delay: 0.5, duration: 1, text: `${pokemon.name} has fainted!`, ease: "none"
                    });
                    break;
                }



                case EffectType.SwitchIn:{


                    const pokemon = getPokemonById(effect.switchInPokemonId);
                    const owner = getPokemonAndOwner(state,pokemon.id).owner;
                    
                    if (isAllyPokemon(pokemon.id)){
                        timeLine.fromTo(messageBox.current, { text: "" }, {
                        delay: 0.5, duration: 1, text: `Go ${pokemon.name}!`, ease: "none",
                        onComplete:()=>{
                            dispatch({
                                type: 'switch-in',
                                id: pokemon.id
                            });
                        }
                        });
                    }
                    else{
                        timeLine.fromTo(messageBox.current, { text: "" }, {
                            delay: 0.5, duration: 1, text: `${owner?.name} has sent out ${pokemon.name}!`, ease: "none",
                            onComplete:()=>{
                                dispatch({
                                    type: 'switch-in',
                                    id: pokemon.id
                                });
                            }
                        });
                    }

                  
                    //watch out we need to "reset" the css state
                    
                    //at some point the state needs to change here.
                    if (isAllyPokemon(pokemon.id)){
                        //left: 40px is the default place for the pokemon.
                        timeLine.fromTo(allyPokemonImage.current,{top:"151px",left:"-150px"},{delay:0.5,left:"40px",opacity:1,duration:1,immediateRender:false})
                    }
                    else{
                        timeLine.fromTo(enemyPokemonImage.current,{top:"100px",left:"350px"},{delay:0.5,left:"240px",opacity:1,duration:1,immediateRender:false})
                    }
                    break;
                }   
                case EffectType.SwitchOut:{

                    
                    const pokemon = getPokemonById(effect.switchOutPokemonId);
                    const owner = getPokemonAndOwner(state,pokemon.id).owner;
                    
                    if (isAllyPokemon(pokemon.id)){
                        timeLine.fromTo(messageBox.current, { text: "" }, {
                        delay: 0.5, duration: 1, text: `Enough ${pokemon.name}, come back!`, ease: "none"
                        });
                    }
                    else{
                        timeLine.fromTo(messageBox.current, { text: "" }, {
                            delay: 0.5, duration: 1, text: `${owner?.name} has returned ${pokemon.name}!`, ease: "none"
                        });
                    }
                    
                    //at some point the state needs to change here.
                    if (isAllyPokemon(pokemon.id)){
                        //left: 40px is the default place for the pokemon.
                        timeLine.fromTo(allyPokemonImage.current,{left:"40px"},{delay:0.5,left:"-150px",duration:1,immediateRender:false})
                    }
                    else{
                        timeLine.fromTo(enemyPokemonImage.current,{left:"350px"},{delay:0.5,left:"240px",duration:1,immediateRender:false})
                    }

                    break;
                }
                case EffectType.UseMove: {
                    const pokemon = getPokemonById(effect.userId);
                    timeLine.fromTo(messageBox.current, { text: "" }, {
                        delay: 0.5, duration: 1, text: `${pokemon.name} used ${effect.moveName}`, ease: "none"
                    });

                    //if move didn't hit, just display a message
                    if (!effect.didMoveHit) {
                        timeLine.fromTo(messageBox.current, { text: "" }, {
                            delay: 0.5, duration: 1, text: `But it missed!`, ease: "none"
                        })
                        return;
                    }
                    //This is the attack animation, a slight move to the right.
                    if (isAllyPokemon(effect.userId)) {
                        timeLine.to(allyPokemonImage.current, { delay: 0.5, left: "60px", duration: 0.3 })
                        timeLine.to(allyPokemonImage.current, { left: "40px", duration: 0.3 })
                    }
                    else {
                        timeLine.to(enemyPokemonImage.current, { delay: 0.5, left: "220px", duration: 0.3 })
                        timeLine.to(enemyPokemonImage.current, { left: "240px", duration: 0.3 })
                    }
                    return;
                }
                case EffectType.Damage: {
                    //Pokemon damaged animation
                    if (isAllyPokemon(effect.targetPokemonId)) {
                        timeLine.to(allyPokemonImage.current, { delay: 0.5, filter: "brightness(50)", duration: 0.1 });
                        timeLine.to(allyPokemonImage.current, { filter: "brightness(1)", duration: 0.1 });
                        timeLine.to(
                            getAllyPokemon().currentStats, {
                            health: effect.targetFinalHealth,
                            duration: 1.5,
                            onUpdate: (val) => {
                                dispatch({
                                    type: 'health-change',
                                    id: val.id,
                                    newHealth: val.currentStats.health
                                });
                            },
                            onUpdateParams: [getAllyPokemon()]
                        })
                    }
                    else {
                        timeLine.to(enemyPokemonImage.current, { delay: 0.5, filter: "brightness(50)", duration: 0.1 });
                        timeLine.to(enemyPokemonImage.current, { filter: "brightness(1)", duration: 0.1 });
                        timeLine.to(
                            getEnemyPokemon().currentStats, {
                            health: effect.targetFinalHealth,
                            duration: 1.5,
                            onUpdate: (val) => {
                                dispatch({
                                    type: 'health-change',
                                    id: val.id,
                                    newHealth: val.currentStats.health
                                });
                            },
                            onUpdateParams: [getEnemyPokemon()]
                        })
                    }

                    //Healthbar animation
                    //try this for healthbar animation.
                    timeLine.to(
                        getAllyPokemon().currentStats, {
                        delay: 0.5,
                        health: 10,
                        duration: 1.5,
                        onUpdate: (val) => {
                            dispatch({
                                type: 'health-change',
                                id: val.id,
                                newHealth: val.currentStats.health
                            });
                        },
                        onUpdateParams: [getEnemyPokemon()]
                    })

                    if (effect.didCritical){
                        timeLine.fromTo(messageBox.current, { text: "" }, {
                            delay: 0.5, duration: 1, text: `It was a critical hit!`, ease: "none"
                        })
                    }
                    if (effect.effectivenessAmt > 1.0){
                        timeLine.fromTo(messageBox.current, { text: "" }, {
                            delay: 0.5, duration: 1, text: `It was super effective!`, ease: "none"
                        })
                    }
                    if (effect.effectivenessAmt < 1.0){
                        timeLine.fromTo(messageBox.current, { text: "" }, {
                            delay: 0.5, duration: 1, text: `It wasn't very effective!`, ease: "none"
                        })
                    }
                }


            }
        });

        //add 1 second of padding.
        timeLine.set({},{},"+=1");
        timeLine.play();
        return;

    }, [nextEvent,turnLog,eventIndex]);

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
    function SetUseItemAction(item: Item) {
        const action: UseItemAction = {
            type: 'use-item-action',
            playerId: 1,
            itemId: item.id
        }
        battleService.SetPlayerAction(action);
    }

    function MakeElementIcons() {
        var icons = [];
        for (let element in ElementType) {
            //var myElement: ElementType = ElementType[element as keyof typeof ElementType];
            var myElement: ElementType = ElementType[element as keyof typeof ElementType];
            icons.push((<ElementIcon key={myElement} element={myElement} />))
        }

        return (<div>{icons}</div>);
    }

    return (
        <div className="App">
            <div className="debug">
                <b>DEBUG INFO</b>
                <div>Current Menu State : {menuState} </div>
                <div> Current Event Index : {eventIndex} </div>
                <div>Turn ID : {battleService.GetCurrentTurn().id} </div>
                <div>Turn State : {battleService.GetCurrentTurn().currentState.type} </div>
                {MakeElementIcons()}
            </div>
            <PokemonSwitchScreen player={state.players[0]} />
            <div className="battle-window">
                <div className="top-screen">
                    <div className='battle-terrain'>
                        {getEnemyPokemon().id !== -1 && <BattlePokemonDisplay imageRef={el => { enemyPokemonImage.current = el;  }} owner={OwnerType.Enemy} pokemon={getEnemyPokemon()} />}
                        {getAllyPokemon().id !== -1 && <BattlePokemonDisplay imageRef={el => { allyPokemonImage.current = el; }} owner={OwnerType.Ally} pokemon={getAllyPokemon()} />}
                    </div>
                    <div style={{ height: "75px", border: "5px solid black", textAlign: "left" }}>
    { menuState !== MenuState.ShowingTurn && <Message animated={true} message={`What will ${getAllyPokemon().name} do?`} /> }
                        {menuState === MenuState.ShowingTurn && <Message
                            animated={false}
                            message={message}
                            messageRef={el => { messageBox.current = el;}} />}
                    </div>
                </div>
                <div className="bottom-screen">
                    {menuState === MenuState.MainMenu && <div className="pokemon-party-pokeballs">{state.players[0].pokemon.map(p => (<span style={{ width: "30px", marginRight: "10px" }}><Pokeball isFainted={p.currentStats.health === 0} /></span>))}</div>}
                    {menuState === MenuState.MainMenu &&
                        <BattleMenu
                            onMenuAttackClick={(evt) => { setMenuState(MenuState.AttackMenu) }}
                            onMenuItemClick={(evt) => { setMenuState(MenuState.ItemMenu) }}
                            onMenuSwitchClick={(evt) => { setMenuState(MenuState.SwitchMenu) }} />}
                    {menuState === MenuState.AttackMenu && <AttackMenuNew onCancelClick={() => setMenuState(MenuState.MainMenu)} onAttackClick={(tech: any) => { SetBattleAction(tech); }} techniques={getAllyPokemon().techniques} />}
                    {menuState === MenuState.ItemMenu && <ItemMenu onCancelClick={() => setMenuState(MenuState.MainMenu)} onItemClick={(item: any) => { console.log("item has been clicked"); SetUseItemAction(item) }} items={state.players[0].items} />}
                    {menuState === MenuState.SwitchMenu && <PokemonSwitchScreen showCancelButton={true} onCancelClick={() => setMenuState(MenuState.MainMenu)} onPokemonClick={(pokemon) => { SetSwitchAction(pokemon.id); }} player={battleService.GetAllyPlayer()} />
                    }
                    {menuState === MenuState.FaintedSwitchMenu && <PokemonSwitchScreen onPokemonClick={(pokemon) => { SetSwitchAction(pokemon.id); }} player={state.players[0]} />}

                </div>
            </div>
        </div >
    );
}

export default Battle;
