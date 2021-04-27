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
import BattleService, { GameEventHandler } from 'game/BattleService';
import { Pokemon } from 'game/Pokemon/Pokemon';
import GameOverScreen from 'components/GameOverScreen/GameOverScreen';
import { Status } from 'game/HardStatus/HardStatus';
import { Player } from 'game/Player/PlayerBuilder';

import ReactRain from "react-rain-animation";
import "react-rain-animation/lib/style.css";
import { WeatherType } from 'game/Weather/Weather';
import { Field, OnNewTurnLogArgs } from 'game/BattleGame';
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
    GameOver = 'game-over',
}

type State = {
    field: Field,
}

type UIAction = {
    type: 'status-change' | 'switch-in' | 'switch-out' | 'health-change' | 'state-change' | 'use-technique' | 'substitute-broken' | 'substitute-created'
    id: number,
    targetId?: number | undefined,
    newHealth?: number | undefined
    field?: Field,
    newStatus?: Status
    
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
    gameEventHandler?:GameEventHandler,
    allyPlayerID:number,
    showDebug?: boolean,
    hideMenu?: boolean
    onLoad?:()=>void;
}

const Battle: React.FunctionComponent<Props> = (props) => {

    const battleService = props.battle;

    const reducer = function (state:State, action: UIAction): State {
        var newState = _.cloneDeep(state);
        switch (action.type) {
            //for syncing the state with the server.
            case 'state-change': {
                return { field: action.field! };
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

    const initialState:State = {
        field:{
            players:[],
            entryHazards:[]
        }
    }
    const [battleState, dispatch] = useReducer(reducer,initialState);
    const [menuState, setMenuState] = useState(MenuState.Loading);
    const [turnInfo, setTurnInfo] = useState<OnNewTurnLogArgs | undefined>(undefined);
    const [winningPlayer, setWinningPlayer] = useState<number | undefined>(undefined)
    const [runningAnimations, setRunningAnimations] = useState(false);



    const battleEvents = useRef<Array<BattleEvent>>([]);
    //this is used to force update the battle events animation effect, but we use the ref above because of problems getting it to work.
    const [battleEventsTemp, setBattleEventsTemp] = useState<Array<BattleEvent>>([]);



    //for animation purposes
    const allyPokemonImage = useRef(null);
    const enemyPokemonImage = useRef(null);
    const messageBox = useRef(null);

    const allyPotionNode = useRef(null);
    const enemyPotionNode = useRef(null);



    const newTurnLogCallback = useCallback((args:OnNewTurnLogArgs)=>{
        console.log("testing our new turn log?",args,menuState,battleEvents,turnInfo);        
        setTurnInfo(args);
        setMenuState(MenuState.ShowingTurn);        
        battleEvents.current = battleEvents.current.concat(args.eventsSinceLastTime);
        setBattleEventsTemp(battleEvents.current);
    },[]);

    /* eslint-disable */
    useEffect( () => {

     function initializeService (){

            let eventHandler: GameEventHandler = battleService;
            if (props.gameEventHandler){
                console.log("game event handler found",props.gameEventHandler);
                eventHandler = props.gameEventHandler
            }

            eventHandler.OnGameStart.on(args=>{
            
                if (menuState === MenuState.ShowingTurn){
                    return;
                }
                
                console.log("on game start in the event handler!",args);
                
    
                dispatch({
                    id:0,
                    type:'state-change',
                    field:_.cloneDeep(args.field)
                })
            
               setMenuState(MenuState.MainMenu);
                
            }); 

        eventHandler.OnNewTurnLog.on(newTurnLogCallback);

        eventHandler.OnStateChange.on((args: { newField: any; }) => {
            console.log("state - change is happening",args);
            dispatch({
                id: 0,
                type: 'state-change',
                field: _.cloneDeep(args.newField)
            })

            //in case we are joining a game in progress.
            if (menuState === MenuState.Loading){
                setMenuState(MenuState.MainMenu);
            }
        });


        console.log("our game has loiaded???",eventHandler,props.gameEventHandler);

        //battleService.Start();
    }
    initializeService();
    props.onLoad  && props.onLoad();
    }, []);
    /* eslint-enable */


    function getAllyPlayer() {
        //TODO - we need to pass in the ally player id here.
        const player = battleState.field.players.find(p => p.id === props.allyPlayerID);
        if (player === undefined) {
            throw new Error(`Could not find player in call to isAllyPokemon()`);
        }
        return player;
    }
    function getEnemyPlayer() {
        //TODO - we need to pass in the ally player id here.
        const player = battleState.field.players.find(p => p.id !== props.allyPlayerID);
        if (player === undefined) {
            throw new Error(`Could not find player in call to isAllyPokemon()`);
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
        return GetActivePokemon(getAllyPlayer());
    }
    function getEnemyPokemon(): Pokemon {
        return GetActivePokemon(getEnemyPlayer());
    }
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
        else if (turnInfo.currentTurnState === 'awaiting-switch-action' && turnInfo.waitingForSwitchIds.filter(id => id === getAllyPlayer().id).length > 0) {
            //should check to see if it is our pokemon
            setMenuState(MenuState.FaintedSwitchMenu);
        }
        //Perhaps this should happen all the time no matter what
        else {
            setMenuState(MenuState.MainMenu);
            dispatch({
                id: 0,
                type: 'state-change',
                field: turnInfo.field
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turnInfo]);

    /* eslint-disable */
    useEffect(() => {

        console.log("trying to run animations",turnInfo,menuState,battleEvents,runningAnimations);
        if (turnInfo === undefined || menuState !== MenuState.ShowingTurn || battleEvents.current.length == 0) {
            return;
        }
        if (runningAnimations === true) {
            return;
        }
        //so that the animations don't get set twice.
        setRunningAnimations(true);

        console.log("animations a",turnInfo,menuState,battleEvents,runningAnimations);


        //default times
        const defaultDelayTime: number = 0.1;
        const healthAnimationTime: number = 0.1;
        const messageAnimationTime: number = 0.1;
        const attackAnimationTime: number = 0.1;
        const damageAnimationTime: number = 0.1;
        const defaultAnimationTime: number = 0.1;

        const effect = battleEvents.current[0];

        const nextEvent = () => {

            //update the state based on the current effect
            let tempEvents = _.cloneDeep(battleEvents.current);
            tempEvents.shift();
            battleEvents.current = tempEvents;
            setBattleEventsTemp(battleEvents.current)
            if (battleEvents.current.length === 0) {
                onEndOfTurnLog();
            }
        }

        const timeLine = gsap.timeline(
            {
                paused: true,
                onComplete: () => {
                    setRunningAnimations(false);

                    if (effect.resultingState !== undefined) {
                        dispatch({
                            id: 0,
                            type: 'state-change',
                            field: _.cloneDeep(effect.resultingState)
                        })
                    }
                    nextEvent();
                }
            });


        //testing our animate message timeline function
        const animateMessage = function (text: string, onComplete?: () => void | undefined) {
            timeLine.fromTo(messageBox.current, { text: "" }, {
                delay: defaultDelayTime, duration: messageAnimationTime, text: text, ease: "none", immediateRender: false, onComplete: onComplete
            });
        }

        console.log("we got to running animations!",effect);
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
                    animObj.currentStats,
                    {
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
                const owner = getPokemonAndOwner(battleState, pokemon.id).owner;

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
                    delay: defaultDelayTime, duration: messageAnimationTime, text: `${pokemon.name} has fainted!`, ease: "none"
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
                        type: 'state-change',
                        id: pokemon.id,
                        field: effect.resultingState!
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
                const pokemon = getPokemonById(effect.switchInPokemonId);
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

                const pokemon = getPokemonById(effect.switchOutPokemonId);
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
                const pokemon = getPokemonById(effect.userId);
                animateMessage(`${pokemon.name} used ${effect.techniqueName}`);

                if (!effect.didTechniqueHit) {
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
                break;
            }
        }
        //add 1 second of padding.
        timeLine.set({}, {}, "+=0.1");
        timeLine.play();

        return;

    }, [onEndOfTurnLog, turnInfo,menuState, battleEventsTemp]);
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

        if (!actionSuccessful) {
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
        console.log("set switch action has been returned",actionSuccessful);
        if (!actionSuccessful) {
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
                try{
                return `What will ${getAllyPokemon().name} do?`
                }
                catch(e){
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
                var validActions = battleService.GetValidActions(getAllyPlayer().id);
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
            onAttackClick={(tech: any) => { SetBattleAction(tech.id); }}
            techniques={getAllyPokemon().techniques} />

        const itemMenu = <ItemMenu onCancelClick={() => setMenuState(MenuState.MainMenu)}
            onItemClick={(item: any) => { SetUseItemAction(item.id) }}
            items={getAllyPlayer().items} />

        const switchMenu = <PokemonMiniInfoList
            showCancelButton={true}
            onCancelClick={() => setMenuState(MenuState.MainMenu)}
            onPokemonClick={(pokemon) => { SetSwitchAction(pokemon.id); }}
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
                return <PokemonInfoMenu onCancelClick={()=>setMenuState(MenuState.MainMenu)} players={[getAllyPlayer(), getEnemyPlayer()]} />
            }
            case MenuState.SwitchMenu: {
                return switchMenu;
            }
            default: {
                return <></>
            }
        }
    }


    return (
        (menuState === MenuState.Loading ? <div>Loading...</div> : <div className="App">
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
                {(props.hideMenu === undefined || props.hideMenu===false) && <div className="bottom-screen">
                    {bottomMenu()}
                </div>
                }
            </div>
        </div>)

    );
}

export default Battle;
