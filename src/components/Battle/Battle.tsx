import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';


import { OnNewTurnLogArgs } from "game/Battle";
import { SwitchPokemonAction, UseItemAction } from "game/BattleActions";
import BattleMenu from "components/battlemenu/BattleMenu";
import BattlePokemonDisplay, { OwnerType } from "components/BattlePokemonDisplay/BattlePokemonDisplay";
import ItemMenu from "components/ItemMenu/ItemMenu";
import AttackMenuNew from "components/AttackMenuNew/AttackMenuNew";
import './Battle.css';
import Message from "components/Message/Message";
import PokemonSwitchScreen from "components/PokemonSwitchScreen/PokemonSwitchScreen";
import { GetActivePokemon } from "game/HelperFunctions";
import Debug from "components/Debug/Debug";
import Pokeball from "components/Pokeball/Pokeball"

import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { CSSPlugin } from "gsap/CSSPlugin";

import _ from "lodash"; //for deep cloning purposes to make our functions pure.
import { BattleEvent, BattleEventType } from 'game/BattleEvents'
import BattleService from 'game/Battle';
import { Pokemon, PokemonBuilder } from 'game/Pokemon/Pokemon';
import GameOverScreen from 'components/GameOverScreen/GameOverScreen';
import { Status } from 'game/HardStatus/HardStatus';
import { Player } from 'game/Player/PlayerBuilder';
import PokemonInfo from 'components/PokemonInfoScreen/PokemonInfoScreen';
import { ElementType } from 'game/ElementType';

gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(CSSPlugin);


enum MenuState {
    None = 'none',
    MainMenu = 'main=menu',
    AttackMenu = 'attack-menu',
    ItemMenu = 'item-menu',
    SwitchMenu = 'switch-menu',
    FaintedSwitchMenu = 'fainted-switch-menu',
    ShowingTurn = 'showing-turn',
    PokemonInfo = 'pokemon-info',
    GameOver = 'game-over',
}

type State = {
    players: Array<Player>,
}

type Action = {
    type: 'status-change' | 'switch-in' | 'switch-out' | 'health-change' | 'state-change' | 'use-technique' | 'substitute-broken' | 'substitute-created'
    id: number,
    targetId?: number | undefined,
    newHealth?: number | undefined
    newState?: Array<Player>
    newStatus?: Status
}

const getPokemonAndOwner = function (state: State, pokemonId: number): { owner: Player, pokemon: Pokemon } {
    let pokemon;
    const pokemonOwner = state.players.find(p => {
        return p.pokemon.find(p => {
            if (p.id === pokemonId) {
                pokemon = p;
            }
            return p.id === pokemonId;
        });
    });

    if (pokemon === undefined) {
        throw new Error(`Could not find pokemon with id ${pokemonId}`);
    }
    if (pokemonOwner === undefined) {
        throw new Error(`Could not find owner for pokemon with id ${pokemonId}`)
    }
    return { owner: pokemonOwner, pokemon: pokemon }
}


interface Props {
    onEnd: () => void;
    battle: BattleService
}

const Battle: React.FunctionComponent<Props> = (props) => {

    const battleService = props.battle;

    const initialState: State = {
        players: props.battle.GetPlayers()
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
                if (action.newHealth === undefined) {
                    return state;
                }
                pokemonData.pokemon.currentStats.hp = action.newHealth;
                return newState;
            }
            case 'status-change': {
                const pokemonData = getPokemonAndOwner(newState, action.id);

                if (action.newStatus === undefined) {
                    action.newStatus = Status.None
                }

                pokemonData.pokemon.status = action.newStatus;
                return newState;
            }
            case 'substitute-broken': {
                const pokemonData = getPokemonAndOwner(newState, action.id);
                pokemonData.pokemon.hasSubstitute = false;
                return newState;
            }
            case `substitute-created`: {
                const pokemonData = getPokemonAndOwner(newState, action.id);
                pokemonData.pokemon.hasSubstitute = true;
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
    const [turnInfo, setTurnInfo] = useState<OnNewTurnLogArgs | undefined>(undefined);
    const [battleEvents, setBattleEvents] = useState<Array<BattleEvent>>([]);
    const [winningPlayer, setWinningPlayer] = useState<number | undefined>(undefined)
    const [runningAnimations, setRunningAnimations] = useState(false);
    const [pokemonInfo, setPokemonInfo] = useState<Pokemon>(PokemonBuilder().UseGenericPokemon().OfElementalTypes([ElementType.Normal]).Build());

    ;

    const [state, dispatch] = useReducer(reducer, initialState);

    //for animation purposes
    const allyPokemonImage = useRef(null);
    const enemyPokemonImage = useRef(null);
    const messageBox = useRef(null);

    const allyPotionNode = useRef(null);
    const enemyPotionNode = useRef(null);

    /* eslint-disable */
    useEffect(() => {
        battleService.onNewTurnLog.on(args => {

            //something 
            setTurnInfo(args);
            setBattleEvents(battleEvents.concat(_.cloneDeep(args).currentTurnLog));
            setMenuState(MenuState.ShowingTurn);
        });

        battleService.onStateChange.on(args => {
            dispatch({
                id: 0,
                type: 'state-change',
                newState: _.cloneDeep(args.newState)
            })
        });
    }, []);
    /* eslint-enable */

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
        return GetActivePokemon(state.players[0]);
    }
    function getEnemyPokemon(): Pokemon {
        return GetActivePokemon(state.players[1]);
    }

    //our simple state machine for our events log.

    //NEW: This should be called at the end of the turn log animation.
    //this is only used once
    const onEndOfTurnLog = useCallback(() => {

        if (turnInfo === undefined) {
            return;
        }

        const turnLogCopy = turnInfo;
        setTurnInfo(undefined);


        if (turnInfo.currentTurnState === 'game-over') {
            setWinningPlayer(turnLogCopy.winningPlayerId);
            setMenuState(MenuState.GameOver)
        }
        else if (turnInfo.currentTurnState === 'awaiting-switch-action' && turnInfo.waitingForSwitchIds.filter(id => id === 1).length > 0) {
            //should check to see if it is our pokemon
            setMenuState(MenuState.FaintedSwitchMenu);
        }
        //Perhaps this should happen all the time no matter what
        else {
            setMenuState(MenuState.MainMenu);
            dispatch({
                id: 0,
                type: 'state-change',
                newState: turnInfo.newState
            })
        }

    }, [turnInfo]);





    /* eslint-disable */
    useEffect(() => {
        if (turnInfo === undefined || menuState !== MenuState.ShowingTurn || battleEvents.length == 0) {
            return;
        }
        if (runningAnimations === true) {
            return;
        }
        //so that the animations don't get set twice.
        setRunningAnimations(true);

        //this could be extracted to the useBattleAnimations() hook
        //we need to pass in the state
        //we need to pass in the ref to the messageBox
        //we need to pass in the ref to the pokemonNodes        

        //default times
        const defaultDelayTime: number = 0.2;
        const healthAnimationTime: number = 0.2;
        const messageAnimationTime: number = 0.2;
        const attackAnimationTime: number = 0.2;
        const damageAnimationTime: number = 0.1;
        const defaultAnimationTime: number = 0.2;

        const nextEvent = () => {

            let copy = battleEvents.slice();
            copy.shift();
            setBattleEvents(copy);

            if (copy.length === 0) {
                onEndOfTurnLog();
            }
        }

        const timeLine = gsap.timeline({ paused: true, onComplete: () => { setRunningAnimations(false); nextEvent(); } });


        //testing our animate message timeline function
        const animateMessage = function (text: string, onComplete?: () => void | undefined) {
            timeLine.fromTo(messageBox.current, { text: "" }, {
                delay: defaultDelayTime, duration: messageAnimationTime, text: text, ease: "none", immediateRender: false, onComplete: onComplete
            });
        }

        //we need to delay these calls because the state needs to update per animation.
        const effect = battleEvents[0];

        switch (effect.type) {


            case BattleEventType.GenericMessage: {
                animateMessage(effect.defaultMessage);
                break;
            }

            case BattleEventType.Heal: {
                const pokemon = getPokemonById(effect.targetPokemonId);

                let animObj;
                isAllyPokemon(pokemon.id) ? animObj = getAllyPokemon() : animObj = getEnemyPokemon();
                timeLine.to(

                    animObj.currentStats, {
                    onStart: () => {
                        //in case the pokemon has switched we need to reset the pokemon object to use.
                        isAllyPokemon(pokemon.id) ? animObj = getAllyPokemon() : animObj = getEnemyPokemon();
                    },
                    delay: defaultDelayTime,
                    hp: effect.targetFinalHealth,
                    duration: healthAnimationTime,
                    onUpdate: (val: any) => {
                        dispatch({
                            type: 'health-change',
                            id: val.id,
                            newHealth: val.currentStats.hp
                        });
                    },
                    onUpdateParams: [animObj]
                })
                break;
            }

            case BattleEventType.UseItem: {

                const pokemon = getPokemonById(effect.targetPokemonId);
                const owner = getPokemonAndOwner(state, pokemon.id).owner;

                if (owner === undefined) {
                    throw new Error("Owner was undefined in call getPokemonAndOwner @ Animation Effect Use Item");
                }

                //Show the message box
                animateMessage(`${owner.name} used ${effect.itemName} on ${pokemon.name}`);

                let potionNode;
                isAllyPokemon(pokemon.id) ? potionNode = allyPotionNode.current : potionNode = enemyPotionNode.current
                timeLine.fromTo(potionNode, { opacity: 0 }, { delay: defaultDelayTime, opacity: 1, top: "-=100", duration: defaultAnimationTime, immediateRender: false, clearProps: "opacity,top" });

                break;

            }
            case BattleEventType.PokemonFainted: {
                const pokemon = getPokemonById(effect.targetPokemonId);

                let pokemonNode;
                isAllyPokemon(pokemon.id) ? pokemonNode = allyPokemonImage.current : pokemonNode = enemyPokemonImage.current;

                timeLine.to(pokemonNode, { delay: defaultDelayTime, top: "+=100", opacity: 0, duration: defaultAnimationTime })
                timeLine.fromTo(messageBox.current, { text: "" }, {
                    delay: defaultDelayTime, duration: 1, text: `${pokemon.name} has fainted!`, ease: "none"
                });

                break;
            }

            case BattleEventType.StatusChange: {
                const pokemon = getPokemonById(effect.targetPokemonId);

                let message = `${pokemon.name} is now ${effect.status.toLowerCase()}`;
                if (effect.defaultMessage) {
                    message = effect.defaultMessage;
                }
                animateMessage(message, () => {
                    dispatch({
                        type: 'status-change',
                        id: pokemon.id,
                        newStatus: effect.status
                    });
                })
                break;
            }

            case BattleEventType.CantAttack: {

                const pokemon = getPokemonById(effect.targetPokemonId);
                timeLine.fromTo(messageBox.current, { text: "" }, {
                    delay: defaultDelayTime,
                    duration: messageAnimationTime,
                    text: `${pokemon.name} could not attack due to being ${effect.reason.toLowerCase()}`,
                })
                break;
            }

            case BattleEventType.SwitchIn: {

                console.log("Switching In Animation Playing");

                const pokemon = getPokemonById(effect.switchInPokemonId);
                const owner = getPokemonAndOwner(state, pokemon.id).owner;

                let switchInMessage;
                isAllyPokemon(pokemon.id) ? switchInMessage = `Go ${pokemon.name}!` : switchInMessage = `${owner?.name} has sent out ${pokemon.name}!`;
                timeLine.fromTo(messageBox.current, { text: "" }, {
                    delay: defaultDelayTime, duration: messageAnimationTime, text: switchInMessage, ease: "none",
                    onComplete: () => {
                        dispatch({
                            type: 'switch-in',
                            id: pokemon.id
                        });
                    }
                });

                if (isAllyPokemon(pokemon.id)) {
                    //left: 40px is the default place for the pokemon.
                    timeLine.fromTo(allyPokemonImage.current, { top: "151px", left: "-150px" }, { delay: defaultDelayTime, left: "40px", opacity: 1, duration: defaultAnimationTime, immediateRender: false })
                }
                else {
                    timeLine.fromTo(enemyPokemonImage.current, { top: "100px", left: "350px" }, { delay: defaultDelayTime, left: "240px", opacity: 1, duration: defaultAnimationTime, immediateRender: false })
                }
                break;
            }
            case BattleEventType.SwitchOut: {

                const pokemon = getPokemonById(effect.switchOutPokemonId);
                const owner = getPokemonAndOwner(state, pokemon.id).owner;

                let switchOutMessage;
                isAllyPokemon(pokemon.id) ? switchOutMessage = `Enough ${pokemon.name}, come back!` : switchOutMessage = `${owner?.name} has returned ${pokemon.name}!`;
                timeLine.fromTo(messageBox.current, { text: "" }, {
                    delay: defaultDelayTime, duration: messageAnimationTime, text: switchOutMessage, ease: "none"
                });

                if (isAllyPokemon(pokemon.id)) {
                    //left: 40px is the default place for the pokemon.
                    timeLine.fromTo(allyPokemonImage.current, { left: "40px" }, { delay: defaultDelayTime, left: "-150px", duration: defaultAnimationTime, immediateRender: false })
                }
                else {
                    timeLine.fromTo(enemyPokemonImage.current, { left: "240px" }, { delay: defaultDelayTime, left: "450px", duration: defaultAnimationTime, immediateRender: false })
                }

                break;
            }
            case BattleEventType.UseMove: {


                const pokemon = getPokemonById(effect.userId);
                animateMessage(`${pokemon.name} used ${effect.moveName}`);

                if (!effect.didMoveHit) {
                    animateMessage('But it missed');
                    break;

                }
                if (isAllyPokemon(effect.userId)) {
                    timeLine.to(allyPokemonImage.current, { delay: defaultDelayTime, left: "60px", duration: attackAnimationTime })
                    timeLine.to(allyPokemonImage.current, { left: "40px", duration: attackAnimationTime })
                }
                else {
                    timeLine.to(enemyPokemonImage.current, { delay: defaultDelayTime, left: "220px", duration: attackAnimationTime })
                    timeLine.to(enemyPokemonImage.current, { left: "240px", duration: attackAnimationTime })
                }
                break;
            }
            case BattleEventType.SubstituteBroken: {
                dispatch({
                    type: 'substitute-broken',
                    id: effect.targetPokemonId
                })
                break;
            }
            case BattleEventType.SubstituteCreated: {
                dispatch({
                    type: 'substitute-created',
                    id: effect.targetPokemonId
                })
                break;
            }
            case BattleEventType.Damage: {
                //when this is made on a switch out, the ally pokemon is the original pokemon

                let pokemonNode;
                isAllyPokemon(effect.targetPokemonId) ? pokemonNode = allyPokemonImage.current : pokemonNode = enemyPokemonImage.current;

                let pokemonObj;
                isAllyPokemon(effect.targetPokemonId) ? pokemonObj = getAllyPokemon() : pokemonObj = getEnemyPokemon();

                //Pokemon damaged animation
                timeLine.to(pokemonNode, { delay: defaultDelayTime, filter: "brightness(50)", duration: damageAnimationTime });
                timeLine.to(pokemonNode, { filter: "brightness(1)", duration: damageAnimationTime });
                timeLine.to(
                    pokemonObj.currentStats, {
                    hp: effect.targetFinalHealth,
                    duration: healthAnimationTime,
                    onUpdate: (val: any) => {
                        dispatch({
                            type: 'health-change',
                            id: val.id,
                            newHealth: val.currentStats.hp
                        });
                    },
                    onUpdateParams: [pokemonObj]
                });
                if (effect.didCritical) {
                    animateMessage("It was a critical hit");
                }
                if (effect.effectivenessAmt > 1.0) {
                    animateMessage("It was super effective");
                }
                if (effect.effectivenessAmt < 1.0) {
                    animateMessage("It wasn't very effective");
                }
                break;
            }

        }
        //add 1 second of padding.
        timeLine.set({}, {}, "+=0.1");
        timeLine.play();

        return;

    }, [onEndOfTurnLog, turnInfo, battleEvents]);
    /* eslint-enable */

    function SetBattleAction(techniqueId: number) {
        battleService.SetPlayerAction({
            playerId: 1, //todo : get player id
            pokemonId: state.players[0].currentPokemonId, //todo: get proper pokemon id
            moveId: techniqueId,
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
    function SetUseItemAction(itemId: number) {
        const action: UseItemAction = {
            type: 'use-item-action',
            playerId: 1,
            itemId: itemId
        }
        battleService.SetPlayerAction(action);
    }

    function HandlePokemonInfoScreenExit(){
        setMenuState(MenuState.SwitchMenu);
    }


    function GetMenuMessage() {
        switch (menuState) {
            case MenuState.MainMenu: {
                return `What will ${getAllyPokemon().name} do?`
            }
            case MenuState.SwitchMenu: {
                return `Which pokemon do you want to switch to?`
            }
            case MenuState.AttackMenu: {
                return `Select an attack`
            }
            case MenuState.ItemMenu: {
                return `Select an item to use`
            }
            case MenuState.FaintedSwitchMenu: {
                return `Which pokemon do you want to switch to?`
            }
            case MenuState.GameOver: {
                if (winningPlayer === undefined) {
                    throw new Error('Could not find winning player for game over screen in Battle.tsx');
                }
                if (state.players[0].id === winningPlayer) {
                    return `You have won the battle!`
                }
                else {
                    return `All your pokemon have fainted!, You have lost the battle!`
                }
            }
            default: {
                return ''
            }
        }
    }

    return (
        <div className="App">
            <Debug players={state.players} battleService={battleService} />
            <div className="battle-window">
                <div className="top-screen">
                    <div className='battle-terrain'>
                        <div className="enemy-party-pokeballs">{state.players[1].pokemon.map(p => (<span key={p.id} style={{ width: "15px", marginRight: "10px" }}><Pokeball isFainted={p.currentStats.hp === 0} /></span>))}</div>
                        {getEnemyPokemon().id !== -1 && <BattlePokemonDisplay potionRef={el => enemyPotionNode.current = el} imageRef={el => { enemyPokemonImage.current = el; }} owner={OwnerType.Enemy} pokemon={getEnemyPokemon()} />}
                        {getAllyPokemon().id !== -1 && <BattlePokemonDisplay potionRef={el => allyPotionNode.current = el} imageRef={el => { allyPokemonImage.current = el; }} owner={OwnerType.Ally} pokemon={getAllyPokemon()} />}
                    </div>
                    <div style={{ height: "75px", border: "5px solid black", textAlign: "left" }}>
                        {menuState !== MenuState.ShowingTurn && <Message writeTimeMilliseconds={500} animated={true} message={`${GetMenuMessage()}`} />}
                        {menuState === MenuState.ShowingTurn && <Message
                            animated={false}
                            message={"{}"}
                            messageRef={el => { messageBox.current = el; }} />}
                    </div>
                </div>
                <div className="bottom-screen">
                    {menuState === MenuState.MainMenu && <div className="pokemon-party-pokeballs">{state.players[0].pokemon.map(p => (<span key={p.id} style={{ width: "30px", marginRight: "10px" }}><Pokeball isFainted={p.currentStats.hp === 0} /></span>))}</div>}
                    {menuState === MenuState.MainMenu &&
                        <BattleMenu
                            onMenuAttackClick={(evt) => { setMenuState(MenuState.AttackMenu) }}
                            onMenuItemClick={(evt) => { setMenuState(MenuState.ItemMenu) }}
                            onMenuSwitchClick={(evt) => { setMenuState(MenuState.SwitchMenu) }} />}
                    {menuState === MenuState.AttackMenu && <AttackMenuNew onCancelClick={() => setMenuState(MenuState.MainMenu)} onAttackClick={(tech: any) => { console.log(tech); SetBattleAction(tech.id); }} techniques={getAllyPokemon().techniques} />}
                    {menuState === MenuState.ItemMenu && <ItemMenu onCancelClick={() => setMenuState(MenuState.MainMenu)} onItemClick={(item: any) => { SetUseItemAction(item.id) }} items={state.players[0].items} />}
                    {menuState === MenuState.SwitchMenu && <PokemonSwitchScreen showCancelButton={true} onCancelClick={() => setMenuState(MenuState.MainMenu)} onPokemonClick={(pokemon) => {SetSwitchAction(pokemon.id); }} player={battleService.GetAllyPlayer()} />
                    }
                    {menuState === MenuState.FaintedSwitchMenu && <PokemonSwitchScreen onPokemonClick={(pokemon) => { SetSwitchAction(pokemon.id); }} player={state.players[0]} />}
                    {menuState === MenuState.PokemonInfo && <PokemonInfo onExitClick={HandlePokemonInfoScreenExit} pokemon={pokemonInfo} />}
                    {menuState === MenuState.GameOver && <GameOverScreen onReturnClick={() => props.onEnd()} />}

                </div>
            </div>
        </div >
    );
}

export default Battle;
