import React, { useState, useEffect, useCallback, useReducer } from 'react';

import { Pokemon, Player, Technique, Item, Status } from '../../interfaces/pokemon';
import BattleMenu from "../battlemenu/BattleMenu";
import BattlePokemonDisplay, { OwnerType } from "../BattlePokemonDisplay/BattlePokemonDisplay";
import ItemMenu from "../ItemMenu/ItemMenu";
import AttackMenu from "../AttackMenu/AttackMenu";

import Message from "../Message/Message";

import _ from "lodash";


/*
For now we are using this app component to test out and fiddle with our ui components.
*/


//Determining our data to use for showing messages

enum BattleEventType {
    UseMove = 'use-move',
    SwitchPokemon = 'switch-pokemon',
    UseItem = 'use-item',
    //non user initiated events can happen here too, (like poison damage, pokemon unable to move because of stun,confusion or frozen etc)
    PokemonFainted = 'pokemon-fainted',
    PoisonDamage = 'poison-damage'

}

enum EffectType {
    Damage = 'damage',
    Heal = 'heal',
    Switch = 'switch',
    Poisoned = 'poisoned',
    StatusChange ='status-change',
    None = 'none' //used in cases where nothing happaned (i.e an attack missed or something)
}

interface Effect {
    type: EffectType, //should be enum?
    target: string, //should be enum?,
    targetName: string,
    targetId: number
    targetFinalHealth: number,
    effectiveness: string,
    message: string
    status?:Status 
}

interface BattleEvent {
    type: BattleEventType,
    message: string,
    effects: Array<Effect>,
}

interface BattleEventsLog {
    state: string,
    events: Array<BattleEvent>
}

const battleState: BattleEventsLog = {
    state: 'showing-turn',
    events: [
        {
            type: BattleEventType.UseMove,
            message: 'Charizard used fireblast!',
            effects: [{
                type: EffectType.Damage,
                target: 'enemy',
                targetName: 'Blastoise',
                targetId: 4,
                targetFinalHealth: 100,
                effectiveness: 'super',
                message: 'it was super effective!'
            }],
        },
        {
            type: BattleEventType.UseMove,
            message: 'Blastoise used Hydropump!',
            effects: [{
                type: EffectType.Damage,
                target: 'enemy',
                targetName: 'charizard',
                targetId: 1,
                targetFinalHealth: 50,
                effectiveness: 'super',
                message: 'It was super effective!'
            }],
        },
        {
            type: BattleEventType.UseItem,
            message: 'You used a potion on charizard!', //if a message is blank, then it should skip the message?,
            effects: [{
                type: EffectType.Heal,
                target: 'enemy',
                targetName: 'charizard',
                targetId: 1,
                targetFinalHealth: 300,
                effectiveness: 'none',
                message: 'Charizard healed a little!'
            }],
        },
        {
            type: BattleEventType.UseMove,
            message: 'Charizard used Poison Blast!',
            effects: [{
                type: EffectType.Damage,
                target: 'enemy',
                targetName: 'Blastoise',
                targetId: 4,
                targetFinalHealth: 20,
                effectiveness: 'Not very effective',
                message: 'It was not very effective!'
            },
            {
                type: EffectType.Poisoned,
                target: 'enemy',
                targetName: 'Blastoise',
                targetId: 4,
                targetFinalHealth: 99999,
                effectiveness: 'none',
                message: 'Blastoise was poisoned!'
            }
            ],
        },
        {
            type: BattleEventType.PoisonDamage,
            message: '',
            effects: [{
                type: EffectType.Damage,
                target: 'enemy',
                targetName: 'Blastoise',
                targetFinalHealth: 10,
                targetId: 4,
                effectiveness: 'none',
                message: 'Blastoise was hurt due to poison!'
            }]
        }
    ]
}


function createCharizard(id: number) {
    const charizard: Pokemon = {
        id: id,
        name: 'Charizard',
        originalStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        currentStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        techniques: [
            {
                id: 1,
                name: 'Fire blast',
                description: 'A fiery blast',
                pp: 10,
                currentPP: 10
            },
            {
                id: 2,
                name: 'Fly',
                description: 'a flying attack',
                pp: 15,
                currentPP: 15
            }
        ]
    }

    return charizard;
}
const createBlastoise = function (id: number) {
    const blastoise: Pokemon = {
        id: id,
        name: 'Blastoise',
        originalStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        currentStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        techniques: [
            {
                id: 3,
                name: 'Hydro Pump',
                pp: 10,
                description: 'hydro pumpy action',
                currentPP: 10
            }
        ]
    }
    return blastoise;
}

const createVenusaur = function (id: number) {
    const venusaur: Pokemon = {
        id: id,
        name: 'Venusaur',
        originalStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        currentStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        techniques: [{
            id: 5,
            name: 'Razor Leaf',
            description: 'some razory leaves',
            pp: 35,
            currentPP: 35
        }]

    }
    return venusaur;
}

/*
'showing-event-message, showing-effect-animation showing-effect-message'?
*/
enum BattleEventUIState {
    ShowingEventMessage = 'showing-event-message',
    ShowingEffectAnimation = 'showing-effect-animation',
    ShowingEffectMessage = 'showing-effect-message',
    None = 'none'
}

type State = {
    players: Array<Player>
}

type Action = {
    type: string
    id: number
}



const initialState: State = {
    players: [
        {
            name: 'Player 1',
            pokemon: [
                createCharizard(1),
                createVenusaur(2),
                createBlastoise(3),
            ],
            items: []
        },
        {
            name: 'Player 2',
            pokemon: [
                createBlastoise(4),
                createCharizard(5),
                createVenusaur(6),
            ],
            items: []
        }
    ]
}

const reducer = function (state = initialState, action: Action): State {

    var newState = _.cloneDeep(state);
    switch (action.type) {
        case 'health-tick-down': {

            //To make this function pure we need to make sure that we update the players pokemon array to be a new array,
            //and include a new pokemon object.
            //and 

            console.log(action);
            console.log('health ticking down!');
            //we have to search the players for the correct pokemon.

            //make a copy of the state
            //we have the find the owner of the pokemon.
            const pokemonOwner = newState.players.find(p => {
                return p.pokemon.find(p => {
                    return p.id === action.id;
                });
            });
            if (pokemonOwner === undefined) {
                return state;
            }
            const pokemon = pokemonOwner.pokemon.find(p => {
                return p.id === action.id;
            });
            if (pokemon === undefined) {
                return state;
            }

            //since we are using lodash we can mutate our state!
            pokemon.currentStats.health -= 1;

            return newState;
        }
        case 'health-tick-up': {

            //To make this function pure we need to make sure that we update the players pokemon array to be a new array,
            //and include a new pokemon object.
            //and 

            console.log(action);
            console.log('health ticking down!');
            //we have to search the players for the correct pokemon.

            //make a copy of the state
            //we have the find the owner of the pokemon.
            const pokemonOwner = newState.players.find(p => {
                return p.pokemon.find(p => {
                    return p.id === action.id;
                });
            });
            if (pokemonOwner === undefined) {
                return state;
            }
            const pokemon = pokemonOwner.pokemon.find(p => {
                return p.id === action.id;
            });
            if (pokemon === undefined) {
                return state;
            }

            //since we are using lodash we can mutate our state!
            pokemon.currentStats.health += 1;

            return newState;
        }
        default: {
            throw new Error();
        }
    }
}


function Battle() {

    const [menuState, setMenuState] = useState('showing-turn');

    const [eventIndex, setEventIndex] = useState(0);
    const [effectIndex, setEffectIndex] = useState(0);

    const [currentEventState, setCurrentEventState] = useState(BattleEventUIState.ShowingEventMessage);

    //these need to be changed now.
    //we should look into 'useReducer'
    const [state, dispatch] = useReducer(reducer, initialState);

    const items: Array<Item> = [
        { id: 1, name: 'potion', description: 'heals 30 health', quantity: 99 },
        { id: 2, name: 'antidote', description: 'cures poison', quantity: 99 }
    ]

    const techniques: Array<Technique> = [
        { id: 1, name: 'Razor Leaf', description: 'throw a bunch of leaves', currentPP: 40, pp: 40 },
        { id: 2, name: 'Fire Blast', description: 'lots of hot fire', currentPP: 40, pp: 10 },
        { id: 3, name: 'Hydro Pump', description: 'lots of wet water', currentPP: 40, pp: 10 },
    ]

    function getAllyPokemon() {
        return state.players[0].pokemon[0];
    }
    function getEnemyPokemon() {
        return state.players[1].pokemon[0];
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
            if (currentEffect.type === EffectType.Damage) {

                const pokemonId = currentEffect.targetId;
                const pokemon = state.players.map(p => {
                    return p.pokemon;
                }).flat().find(p => {
                    return p.id === pokemonId;
                });

                if (pokemon === undefined) {
                    console.error('error could not find pokemon with id :' + pokemonId)
                    return;
                }

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

                const pokemonId = currentEffect.targetId;
                const pokemon = state.players.map(p => {
                    return p.pokemon;
                }).flat().find(p => {
                    return p.id === pokemonId;
                });

                if (pokemon === undefined) {
                    console.error('error could not find pokemon with id :' + pokemonId)
                    return;
                }
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

                const pokemonId = currentEffect.targetId;
                const pokemon = state.players.map(p => {
                    return p.pokemon;
                }).flat().find(p => {
                    return p.id === pokemonId;
                });

                if (pokemon === undefined) {
                    console.error('error could not find pokemon with id :' + pokemonId)
                    return;
                }

                pokemon.status = Status.Poison;
                nextEvent();
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
            <BattlePokemonDisplay owner={OwnerType.Enemy} pokemon={getEnemyPokemon()} />
            <BattlePokemonDisplay owner={OwnerType.Ally} pokemon={getAllyPokemon()} />
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
            {menuState === 'attack-menu' && <AttackMenu onAttackClick={(tech: any) => { console.log(tech) }} techniques={techniques} />}
            {menuState === 'item-menu' && <ItemMenu onItemClick={(item: any) => { console.log(item) }} items={items} />}
        </div>
    );
}

export default Battle;
