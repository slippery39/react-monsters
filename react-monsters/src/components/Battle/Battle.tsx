import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';

import { Actions, SwitchPokemonAction, UseItemAction } from "game/BattleActions";
import BattleMenu from "components/battlemenu/BattleMenu";
import BattlePokemonDisplay, { OwnerType } from "components/BattlePokemonDisplay/BattlePokemonDisplay";
import ItemMenu from "components/ItemMenu/ItemMenu";
import AttackMenuNew from "components/AttackMenuNew/AttackMenuNew";
import './Battle.css';
import Message from "components/Message/Message";
import PokemonMiniInfoList from "components/PokemonSwitchScreen/PokemonMiniInfoList";
import { GetActivePokemon } from "game/HelperFunctions";
import Debug from "components/Debug/Debug";
import Pokeball from "components/Pokeball/Pokeball"

import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { CSSPlugin } from "gsap/CSSPlugin";

import _ from "lodash"; //for deep cloning purposes to make our functions pure.
import { BattleEvent, BattleEventType } from 'game/BattleEvents'
import { BattleService, GameEventHandler, OnStateChangeArgs } from 'game/BattleService';
import { Pokemon } from 'game/Pokemon/Pokemon';
import GameOverScreen from 'components/GameOverScreen/GameOverScreen';
import { Status } from 'game/HardStatus/HardStatus';
import { Player } from 'game/Player/PlayerBuilder';

import ReactRain from "react-rain-animation";
import "react-rain-animation/lib/style.css";
import { WeatherType } from 'game/Weather/Weather';
import { Field, OnNewTurnLogArgs, TurnState } from 'game/BattleGame';
import PokemonInfoMenu from './PokemonInfoMenu/PokemonInfoMenu';



gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(CSSPlugin);


enum MenuState {
    None = 'none',
    Loading = "loading",
    MainMenu = 'main-menu',
    AttackMenu = 'attack-menu',
    ItemMenu = 'item-menu',
    SwitchMenu = 'switch-menu',
    FaintedSwitchMenu = 'fainted-switch-menu',
    ShowingTurn = 'showing-turn',
    PokemonInfoMenu = 'pokemon-info-menu',
    ShowPokemonInfo = 'pokemon-info',
    Waiting = 'waiting',
    GameOver = 'game-over',
}

type State = {
    field: Field,
}

type BattleEventLogState = {
    currentEvent: BattleEvent | undefined
    remainingEvents: BattleEvent[],
    allEventsInfo?: OnNewTurnLogArgs,
}

type BattleEventLogAction = {
    type: 'next-event' | 'add-events' | 'end-events'
    eventsToAdd?: BattleEvent[],
    eventsArgs?: OnNewTurnLogArgs
}

const BattleEventLogReducer = function (state: BattleEventLogState, action: BattleEventLogAction): BattleEventLogState {
    const { currentEvent, remainingEvents } = _.cloneDeep(state);
    const { type, eventsToAdd, eventsArgs } = action;
    switch (type) {
        case 'add-events': {
            if (eventsToAdd === undefined) {
                throw new Error(`We need some events to be able to add-events in Battle.tsx`);
            }
            if (eventsArgs === undefined) {
                throw new Error(`We need some events to be able to add-events in Battle.tsx`);
            }
            let newEvents = remainingEvents.concat(eventsToAdd);
            let newCurrentEvent = undefined
            if (currentEvent === undefined) {
                newCurrentEvent = newEvents[0];
                newEvents = newEvents.slice(1);
            }
            else {
                newCurrentEvent = currentEvent
            }
            return { ...state, ...{ allEventsInfo: eventsArgs, currentEvent: newCurrentEvent, remainingEvents: newEvents } }
        }
        case 'next-event': {
            if (remainingEvents.length === 0) {
                return { ...state, ...{ currentEvent: undefined } }
            }
            let newRemainingEvents: BattleEvent[] = [];
            newRemainingEvents = _.cloneDeep(remainingEvents).slice(1);
            const nextEvent = remainingEvents[0];
            return { ...state, ...{ currentEvent: nextEvent, remainingEvents: newRemainingEvents } }
        }
        case 'end-events': {
            return { ...state, ...{ currentEvent: undefined, remainingEvents: [] } }
        }
        default: {
            throw new Error();
        }
    }
}

const createInitialEventState: () => BattleEventLogState = () => {
    return {
        currentEvent: undefined,
        remainingEvents: [],
        allEventsInfo: undefined
    }
}

type UIAction = {
    type: 'status-change' | 'switch-in' | 'switch-out' | 'health-change' | 'state-change' | 'use-technique' | 'substitute-broken' | 'substitute-created'
    id?: number,
    targetId?: number | undefined,
    newHealth?: number | undefined,
    field?: Field,
    newStatus?: Status,
    newBattleEvent?: BattleEvent
}

const getPokemonAndOwner = function (state: State, pokemonId: number): { owner: Player, pokemon: Pokemon } {
    let pokemon;
    const pokemonOwner = state.field.players.find(p => {
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
    battle: BattleService,
    allyPlayerID: number,
    showDebug?: boolean,
    hideMenu?: boolean
    onLoad?: () => void;
}

const Battle: React.FunctionComponent<Props> = (props) => {

    const battleService = props.battle;

    const reducer = function (state: State, action: UIAction): State {
        var newState = _.cloneDeep(state);
        switch (action.type) {
            //for syncing the state with the server.
            case 'state-change': {

                if (action.field === undefined) {
                    throw new Error(`need a field for a state change action`);
                }
                return { ...newState, ...{ field: action.field } }
            }
            case 'health-change': {

                if (action.id === undefined) {
                    throw new Error(`Need an id for a health-change action`);
                }
                const pokemonData = getPokemonAndOwner(newState, action.id);
                if (action.newHealth === undefined) {
                    return state;
                }
                pokemonData.pokemon.currentStats.hp = action.newHealth;
                return newState;
            }
            case 'status-change': {
                if (action.id === undefined) {
                    throw new Error(`Need an id for a status-change action`);
                }
                const pokemonData = getPokemonAndOwner(newState, action.id);

                if (action.newStatus === undefined) {
                    action.newStatus = Status.None
                }

                pokemonData.pokemon.status = action.newStatus;
                return newState;
            }
            case 'substitute-broken': {
                if (action.id === undefined) {
                    throw new Error(`Need an id for a substitute broken action`);
                }
                const pokemonData = getPokemonAndOwner(newState, action.id);
                pokemonData.pokemon.hasSubstitute = false;
                return newState;
            }
            case `substitute-created`: {
                if (action.id === undefined) {
                    throw new Error(`Need an id for a substitute created action`);
                }
                const pokemonData = getPokemonAndOwner(newState, action.id);
                pokemonData.pokemon.hasSubstitute = true;
                return newState;
            }
            case 'switch-in': {
                if (action.id === undefined) {
                    throw new Error(`Need an id for a switch in action`);
                }
                const pokemonData = getPokemonAndOwner(newState, action.id);
                if (pokemonData.owner) {
                    pokemonData.owner.currentPokemonId = action.id;

                }
                return newState;
            }
            case 'switch-out': {
                if (action.id === undefined) {
                    throw new Error(`Need an id for a switch out action`);
                }
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

    const initialState: State = {
        field: {
            players: [],
            entryHazards: []
        },
    }
    const [battleState, dispatch] = useReducer(reducer, initialState);
    const [battleEventsState, dispatchBattleEvent] = useReducer(BattleEventLogReducer, createInitialEventState());


    const[eventAnimationsRunning,setEventAnimationsRunning] = useState<boolean>(false);

    const [menuState, setMenuState] = useState(MenuState.Loading);
    const [winningPlayer, setWinningPlayer] = useState<number | undefined>(undefined)

    //for animation purposes
    const allyPokemonImage = useRef(null);
    const enemyPokemonImage = useRef(null);
    const messageBox = useRef(null);

    const allyPotionNode = useRef(null);
    const enemyPotionNode = useRef(null);

    //Set Menu State
    useEffect(() => {
        if (battleEventsState.currentEvent !== undefined) {
            setMenuState(MenuState.ShowingTurn);
        }
    }, [battleEventsState.currentEvent]);

    /* eslint-disable */
    useEffect(() => {
        function initializeService() {

            let eventHandler: GameEventHandler = battleService;

            eventHandler.OnGameStart.on(args => {
                console.log("testing our on game start handler");

                if (menuState === MenuState.ShowingTurn) {
                    return;
                }

                console.log("game is starting, here are the args",args);
                dispatch({
                    type: 'state-change',
                    field: _.cloneDeep(args.field)
                })

                setMenuState(MenuState.MainMenu);
            });

            eventHandler.OnNewTurnLog.on((args: OnNewTurnLogArgs) => {

                dispatchBattleEvent({
                    type: 'add-events',
                    eventsToAdd: args.eventsSinceLastTime,
                    eventsArgs: args
                })
            });

            eventHandler.OnStateChange.on((args: OnStateChangeArgs) => {
                console.log("tesintg on on state change handler",args);
                dispatch({
                    type: 'state-change',
                    field: _.cloneDeep(args.newField)
                })

                //in case we are joining a game in progress.
                if (menuState === MenuState.Loading) {
                    if (args.currentTurnState === TurnState.WaitingForSwitchActions && args.actionsNeededIds.filter(id => id === props.allyPlayerID).length > 0) {
                        setMenuState(MenuState.FaintedSwitchMenu)
                    }
                    else if (args.actionsNeededIds.filter(id => id === props.allyPlayerID).length > 0) {
                        setMenuState(MenuState.MainMenu);
                    }
                    else {
                        setMenuState(MenuState.Waiting)
                    }
                }
            });
            //battleService.Start();
        }
        initializeService();
        props.onLoad && props.onLoad();
    }, []);
    /* eslint-enable */


    function getAllyPlayer() {

        console.log(props.allyPlayerID);
        const player = battleState.field.players.find(p => p.id === props.allyPlayerID);
        if (player === undefined) {
            throw new Error(`Could not find player in call to getAllyPlayer() - id : ${props.allyPlayerID}`);
        }
        return player;
    }
    function getEnemyPlayer() {       
        const player = battleState.field.players.find(p => p.id !== props.allyPlayerID);
        if (player === undefined) {
            console.error("enemy player call",battleState.field.players);
            throw new Error(`Could not find player in call to getEnemyPlayer()`);
        }
        return player;
    }

    function isAllyPokemon(id: number): boolean {
        const player = getAllyPlayer();
        return player.pokemon.filter(pokemon => pokemon.id === id).length > 0;
    }

    function getPokemonById(id: number): Pokemon {
        const pokemon = battleState.field.players.map(player => {
            return player.pokemon;
        }).flat().filter(pokemon => pokemon.id === id);

        return pokemon[0];
    }

    function getAllyPokemon(): Pokemon {
        console.log(getAllyPlayer());
        return GetActivePokemon(getAllyPlayer());
    }
    function getEnemyPokemon(): Pokemon {
        return GetActivePokemon(getEnemyPlayer());
    }
    const endEventAnimations = useCallback(() => {

        const eventsInfo = battleEventsState.allEventsInfo;

        dispatchBattleEvent(
            { type: 'end-events' }
        );

        if (eventsInfo === undefined) {
            return;
        }
        if (eventsInfo.currentTurnState === 'game-over') {
            setWinningPlayer(eventsInfo.winningPlayerId);
            setMenuState(MenuState.GameOver)
        }
        else if (eventsInfo.currentTurnState === 'awaiting-switch-action') {
            if (eventsInfo.waitingForSwitchIds.filter(id => id === getAllyPlayer().id).length > 0) {
                //should check to see if it is our pokemon
                setMenuState(MenuState.FaintedSwitchMenu);
            }
            else {
                setMenuState(MenuState.Waiting);
            }
        }
        //Perhaps this should happen all the time no matter what
        else {

            if (eventsInfo.actionsNeededIds.filter(id => id === getAllyPlayer().id).length > 0) {
                setMenuState(MenuState.MainMenu);
            }
            else {
                setMenuState(MenuState.Waiting)
            }

            setMenuState(MenuState.MainMenu);
            dispatch({
                type: 'state-change',
                field: eventsInfo.field
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [battleEventsState.allEventsInfo]);

    /* eslint-disable */
    useEffect(() => {

        //TODO - test the battleEventsState.remainingEvents... this might not be what we want here.
        if (menuState !== MenuState.ShowingTurn || battleEventsState.currentEvent === undefined) {
            return;
        }

        //Important, we have a weird bug where sometimes this effect runs twice when it shouldn't, this should stop that from occuring
        if (eventAnimationsRunning){
            return;
        }
        setEventAnimationsRunning(true);

        //default times
        const defaultDelayTime: number = 0.3;
        const healthAnimationTime: number = 0.5;
        const messageAnimationTime: number = 0.1;
        const attackAnimationTime: number = 0.1;
        const damageAnimationTime: number = 0.1;
        const defaultAnimationTime: number = 0.1;

        const currentEvent = battleEventsState.currentEvent;

        const nextEvent = () => {
            dispatchBattleEvent({
                type: 'next-event'
            });
        }

        const timeLine = gsap.timeline(
            {
                paused: true,
                onComplete: () => {
                    setEventAnimationsRunning(false);
                    if (currentEvent.resultingState !== undefined) {
                        dispatch({
                            type: 'state-change',
                            field: _.cloneDeep(currentEvent.resultingState)
                        })
                    }
                    if (battleEventsState.remainingEvents.length === 0) {
                        endEventAnimations();
                    }
                    else {
                        nextEvent();
                    }
                }
            });

        //testing our animate message timeline function
        const animateMessage = function (text: string, onComplete?: () => void | undefined) {
            timeLine.fromTo(messageBox.current, { text: "" }, {
                delay: defaultDelayTime, duration: messageAnimationTime, text: text, ease: "none", immediateRender: false, onComplete: onComplete
            });
        }

        //TODO - look into the "useImperativeHandle hook along with forwardRefs to make our encapsulated "
        switch (currentEvent.type) {
            case BattleEventType.GenericMessage: {
                animateMessage(currentEvent.defaultMessage);
                break;
            }

            case BattleEventType.Heal: {
                const pokemon = getPokemonById(currentEvent.targetPokemonId);
                let animObj;
                isAllyPokemon(pokemon.id) ? animObj = getAllyPokemon() : animObj = getEnemyPokemon();
                timeLine.to(
                    animObj.currentStats,
                    {
                        onStart: () => {
                            //in case the pokemon has switched we need to reset the pokemon object to use.
                            isAllyPokemon(pokemon.id) ? animObj = getAllyPokemon() : animObj = getEnemyPokemon();
                        },
                        delay: defaultDelayTime,
                        hp: currentEvent.targetFinalHealth,
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
            //We don't really have items anymore
            case BattleEventType.UseItem: {
                const pokemon = getPokemonById(currentEvent.targetPokemonId);
                const owner = getPokemonAndOwner(battleState, pokemon.id).owner;

                if (owner === undefined) {
                    throw new Error("Owner was undefined in call getPokemonAndOwner @ Animation Effect Use Item");
                }

                //Show the message box
                animateMessage(`${owner.name} used ${currentEvent.itemName} on ${pokemon.name}`);

                let potionNode;
                isAllyPokemon(pokemon.id) ? potionNode = allyPotionNode.current : potionNode = enemyPotionNode.current
                timeLine.fromTo(potionNode, { opacity: 0 }, { delay: defaultDelayTime, opacity: 1, top: "-=100", duration: defaultAnimationTime, immediateRender: false, clearProps: "opacity,top" });

                break;
            }
            case BattleEventType.PokemonFainted: {
                const pokemon = getPokemonById(currentEvent.targetPokemonId);

                let pokemonNode;
                isAllyPokemon(pokemon.id) ? pokemonNode = allyPokemonImage.current : pokemonNode = enemyPokemonImage.current;

                timeLine.to(pokemonNode, { delay: defaultDelayTime, top: "+=100", opacity: 0, duration: defaultAnimationTime })
                animateMessage(`${pokemon.name} has fainted!`);
                break;
            }

            case BattleEventType.StatusChange: {
                const pokemon = getPokemonById(currentEvent.targetPokemonId);

                let message = `${pokemon.name} is now ${currentEvent.status.toLowerCase()}`;
                if (currentEvent.defaultMessage) {
                    message = currentEvent.defaultMessage;
                }
                animateMessage(message, () => {
                    dispatch({
                        type: 'state-change',
                        id: pokemon.id,
                        field: currentEvent.resultingState!
                    });
                })
                break;
            }

            //TODO -> use our generic messages instead.
            case BattleEventType.CantAttack: {

                const pokemon = getPokemonById(currentEvent.targetPokemonId);
                timeLine.fromTo(messageBox.current, { text: "" }, {
                    delay: defaultDelayTime,
                    duration: messageAnimationTime,
                    text: `${pokemon.name} could not attack due to being ${currentEvent.reason.toLowerCase()}`,
                })
                break;
            }

            case BattleEventType.SwitchIn: {
                const pokemon = getPokemonById(currentEvent.switchInPokemonId);
                const owner = getPokemonAndOwner(battleState, pokemon.id).owner;

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

                const pokemon = getPokemonById(currentEvent.switchOutPokemonId);
                const owner = getPokemonAndOwner(battleState, pokemon.id).owner;

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
            case BattleEventType.UseTechnique: {
                const pokemon = getPokemonById(currentEvent.userId);
                animateMessage(`${pokemon.name} used ${currentEvent.techniqueName}`);

                if (!currentEvent.didTechniqueHit) {
                    animateMessage('But it missed');
                    break;

                }
                if (isAllyPokemon(currentEvent.userId)) {
                    timeLine.to(allyPokemonImage.current, { delay: defaultDelayTime, left: "60px", duration: attackAnimationTime })
                    timeLine.to(allyPokemonImage.current, { left: "40px", duration: attackAnimationTime })
                }
                else {
                    timeLine.to(enemyPokemonImage.current, { delay: defaultDelayTime, left: "220px", duration: attackAnimationTime })
                    timeLine.to(enemyPokemonImage.current, { left: "240px", duration: attackAnimationTime })
                }
                break;
            }

            //TODO - do we even need these anymore? If we are just updating state after every event anyways?
            case BattleEventType.SubstituteBroken: {
                dispatch({
                    type: 'substitute-broken',
                    id: currentEvent.targetPokemonId
                })
                break;
            }
            case BattleEventType.SubstituteCreated: {
                dispatch({
                    type: 'substitute-created',
                    id: currentEvent.targetPokemonId
                })
                break;
            }
            case BattleEventType.Damage: {
                //when this is made on a switch out, the ally pokemon is the original pokemon

                let pokemonNode;
                isAllyPokemon(currentEvent.targetPokemonId) ? pokemonNode = allyPokemonImage.current : pokemonNode = enemyPokemonImage.current;

                let pokemonObj;
                isAllyPokemon(currentEvent.targetPokemonId) ? pokemonObj = getAllyPokemon() : pokemonObj = getEnemyPokemon();

                //Pokemon damaged animation
                timeLine.to(pokemonNode, { delay: defaultDelayTime, filter: "brightness(50)", duration: damageAnimationTime });
                timeLine.to(pokemonNode, { filter: "brightness(1)", duration: damageAnimationTime });
                timeLine.to(
                    pokemonObj.currentStats, {
                    hp: currentEvent.targetFinalHealth,
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
                break;
            }
        }
        //add 1 second of padding.
        timeLine.set({}, {}, "+=0.3");
        timeLine.play();

        return;

    }, [menuState, battleEventsState.currentEvent]); //TODO: potential failure point here, our animation system might need to be aware of when our reducer state changes.
    /* eslint-enable */

    async function SetBattleAction(techniqueId: number) {
        const currentPokemon = GetActivePokemon(getAllyPlayer());

        const pokemonName = currentPokemon.name;
        const moveName = currentPokemon.techniques.find(t => t.id === techniqueId)?.name


        const actionSuccessful = await battleService.SetPlayerAction({
            playerId: getAllyPlayer().id,
            pokemonId: GetActivePokemon(getAllyPlayer()).id,
            pokemonName: pokemonName,
            moveId: techniqueId,
            moveName: moveName,
            type: Actions.UseTechnique
        });

        if (actionSuccessful) {
            console.log("action was successful!",menuState);
            setMenuState((prevState) => {
                //added this in so we don't accidently overwrite a potential showing turn state
                if (prevState !== MenuState.ShowingTurn) {
                    return MenuState.Waiting
                }
                return prevState;
            })
        }
        else {
            setMenuMessage((prev) => prev === "You cannot use this technique due to an ability, status or held item!" ? prev + "" : "You cannot use this technique due to an ability, status or held item!");
        }
    }
    async function SetSwitchAction(pokemonSwitchId: number) {
        const action: SwitchPokemonAction = {
            type: Actions.SwitchPokemon,
            playerId: getAllyPlayer().id,
            switchPokemonId: pokemonSwitchId
        }

        const actionSuccessful = await battleService.SetPlayerAction(action);

        if (actionSuccessful) {
            setMenuState((prevState) => {
                //added this in so we don't accidently overwrite a potential showing turn state
                if (prevState !== MenuState.ShowingTurn) {
                    return MenuState.Waiting
                }
                return prevState;
            })
        }
        else {
            setMenuMessage((prev) => prev === "You cannot use this technique due to an ability, status or held item!" ? prev + "" : "You cannot use this technique due to an ability, status or held item!");
        }
    }
    function SetUseItemAction(itemId: number) {
        const action: UseItemAction = {
            type: Actions.UseItem,
            playerId: getAllyPlayer().id,
            itemId: itemId
        }
        battleService.SetPlayerAction(action);
    }

    const GetMenuMessage = useCallback(() => {
        switch (menuState) {
            case MenuState.Loading: {
                return "..."
            }
            case MenuState.MainMenu: {
                //TODO - check if this is fixed.. we should not need a try catch block here.
                try {
                    return `What will ${getAllyPokemon().name} do?`
                }
                catch (e) {
                    return `What will you do?`
                }
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
            case MenuState.PokemonInfoMenu: {
                return 'Select a pokemon to view its stats and information'
            }
            case MenuState.Waiting: {
                return "Waiting for other player..."
            }
            case MenuState.GameOver: {
                if (winningPlayer === undefined) {
                    throw new Error('Could not find winning player for game over screen in Battle.tsx');
                }
                if (getAllyPlayer().id === winningPlayer) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuState]);

    //we use an object here instead of a string so we can re-render the message animation if necessary.
    const [menuMessage, setMenuMessage] = useState<string>(GetMenuMessage());

    useEffect(() => {
        setMenuMessage(GetMenuMessage());
    }, [menuState, GetMenuMessage])

    const enemyPartyPokeballs = () => {
        return <div className="enemy-party-pokeballs">

            {getEnemyPlayer().pokemon.map(p => (<span key={p.id} style={{ width: "15px", marginRight: "10px" }}>
                <Pokeball isFainted={p.currentStats.hp === 0} /></span>))}
        </div>
    }

    const enemyPokemonDisplay = () => {
        if (getEnemyPokemon().id === -1) {
            return;
        }
        else
            return (
                <BattlePokemonDisplay potionRef={el => enemyPotionNode.current = el} imageRef={el => { enemyPokemonImage.current = el; }}
                    owner={OwnerType.Enemy}
                    pokemon={getEnemyPokemon()} />)
    }

    const allyPokemonDisplay = () => {
        return (getAllyPokemon().id !== -1 &&
            <BattlePokemonDisplay
                potionRef={el => allyPotionNode.current = el}
                imageRef={el => { allyPokemonImage.current = el; }}
                owner={OwnerType.Ally}
                pokemon={getAllyPokemon()} />)
    }

    const idleMenuMessage = () => {
        return (menuState !== MenuState.ShowingTurn && <Message writeTimeMilliseconds={500} animated={true} message={menuMessage} />)
    }

    const turnLogMessage = () => {
        return (menuState === MenuState.ShowingTurn && <Message
            animated={false}
            message={" "}
            messageRef={el => { messageBox.current = el; }} />)
    }

    const allyPartyPokeballs = () => {
        return (
            <div className="pokemon-party-pokeballs">
                {getAllyPlayer().pokemon.map(p => (<span key={p.id} style={{ width: "15px", marginRight: "10px" }}>
                    <Pokeball isFainted={p.currentStats.hp === 0} /></span>))}
            </div>)
    }

    const bottomMenu = () => {

        const mainMenu = <BattleMenu
            onMenuAttackClick={async () => {
                //this might cause issues when we set it up for multiplayer.
                //maybe this should come with the state?
                let validActions = await battleService.GetValidActions(getAllyPlayer().id);


                if (validActions.filter(act => act.type === Actions.UseTechnique).length === 0) {
                    //use a struggle command instead
                    const struggleCommand = validActions.find(act => act.type === Actions.ForcedTechnique && act.technique.name.toLowerCase() === "struggle");
                    if (struggleCommand === undefined) {
                        throw new Error(`Could not use struggle command`);
                    }
                    battleService.SetInitialAction(struggleCommand);
                }
                else {
                    setMenuState(MenuState.AttackMenu);
                }

            }}
            onMenuItemClick={() => { setMenuState(MenuState.ItemMenu) }}
            onMenuSwitchClick={() => { setMenuState(MenuState.SwitchMenu) }}
            onMenuPokemonInfoClick={() => { setMenuState(MenuState.PokemonInfoMenu) }} />

        const attackMenu = <AttackMenuNew onCancelClick={() => setMenuState(MenuState.MainMenu)}
            onAttackClick={async (tech: any) => { await SetBattleAction(tech.id); }}
            techniques={getAllyPokemon().techniques} />

        const itemMenu = <ItemMenu onCancelClick={() => setMenuState(MenuState.MainMenu)}
            onItemClick={(item: any) => { SetUseItemAction(item.id) }}
            items={getAllyPlayer().items} />

        const switchMenu = <PokemonMiniInfoList
            showCancelButton={true}
            onCancelClick={() => setMenuState(MenuState.MainMenu)}
            onPokemonClick={async (pokemon) => { await SetSwitchAction(pokemon.id); }}
            player={getAllyPlayer()} />



        const faintedSwitchMenu = <PokemonMiniInfoList onCancelClick={() => setMenuState(MenuState.MainMenu)} onPokemonClick={(pokemon) => { SetSwitchAction(pokemon.id); }}
            player={getAllyPlayer()} />


        const gameOver = <GameOverScreen onReturnClick={() => props.onEnd()} />


        switch (menuState) {
            case MenuState.AttackMenu: {
                return attackMenu;
            }
            case MenuState.FaintedSwitchMenu: {
                return faintedSwitchMenu
            }
            case MenuState.GameOver: {
                return gameOver;
            }
            case MenuState.ItemMenu: {
                return itemMenu;
            }
            case MenuState.MainMenu: {
                return mainMenu;
            }
            case MenuState.PokemonInfoMenu: {
                return <PokemonInfoMenu onCancelClick={() => setMenuState(MenuState.MainMenu)} players={[getAllyPlayer(), getEnemyPlayer()]} />
            }
            case MenuState.SwitchMenu: {
                return switchMenu;
            }
            case MenuState.Waiting: {
                return <></>
            }
            default: {
                return <></>
            }
        }
    }


    return (
        (menuState === MenuState.Loading && battleState.field.players.length<2 ? <div>Loading...</div> : <div className="App">
            {props.showDebug && <Debug field={battleState.field} battleService={battleService} />}
            <div className="battle-window">
                <div className="top-screen">
                    <div className='battle-terrain'>
                        {battleState.field.weather?.name === WeatherType.Sunny && <div className='sunny-container'></div>}
                        {battleState.field.weather?.name === WeatherType.Rain && <ReactRain id="react-rain" numDrops="100" />}
                        {battleState.field.weather?.name === WeatherType.Sandstorm && <div className='sandstorm-container'></div>}
                        {enemyPartyPokeballs()}
                        {enemyPokemonDisplay()}
                        {allyPartyPokeballs()}
                        {allyPokemonDisplay()}
                    </div>
                    <div style={{ height: "75px", border: "5px solid black", textAlign: "left" }}>
                        {idleMenuMessage()}
                        {turnLogMessage()}
                    </div>
                </div>
                {(props.hideMenu === undefined || props.hideMenu === false) && <div className="bottom-screen">
                    {bottomMenu()}
                </div>
                }
            </div>
        </div>)

    );
}

export default Battle;
