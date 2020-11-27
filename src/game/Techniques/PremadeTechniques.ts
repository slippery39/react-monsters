import { BattleEffect, TargetType, HealthRestoreType } from "game/Effects/Effects";
import { Status } from "game/HardStatus/HardStatus";
import { Stat } from "game/Stat";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import { ElementType } from "../ElementType";
import { DamageType} from "./Technique";



interface PremadeTechniques {
    [key: string]: BaseTechnique
}


interface BaseTechnique {
    name: string,
    description: string,
    pp: number,
    power: number,
    damageType: DamageType,
    elementalType: ElementType,
    chance: number,
    effects?: Array<BattleEffect>,
}

/*
    things we need to add,
    id
    currentPP
*/



export function GetTech(name: string) {

    const techs: PremadeTechniques = {
        "ice beam": {
            name: "Ice Beam",
            description: '',
            pp: 16,
            power: 90,
            damageType: DamageType.Special,
            elementalType: ElementType.Ice,
            chance: 100,
            effects: [{
                type: 'inflict-status',
                status: Status.Frozen,
                chance: 10,
                target: TargetType.Enemy
            }
            ]
        },
        "surf": {
            name: "Surf",
            description: '',
            pp: 16,
            power: 90,
            damageType: DamageType.Special,
            elementalType: ElementType.Water,
            chance: 100,
            effects: [],
        },
        "rest": {
            name: "Rest",
            description: '',
            pp: 16,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Normal,
            chance: 100,
            effects: [{
                type: 'status-restore',
                forStatus: 'any',
                target: TargetType.Self,
                chance: 100
            },
            {
                type: 'health-restore',
                restoreType: HealthRestoreType.PercentMaxHealth,
                amount: 100,
                chance: 100
            },
            {
                type: 'inflict-status',
                status: Status.Resting,
                chance: 100,
                target: TargetType.Self
            }
            ]
        },
        "toxic": {
            name: "Toxic",
            description: '',
            pp: 16,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Poison,
            chance: 90,
            effects: [{
                type: 'inflict-status',
                status: Status.ToxicPoison,
                target: TargetType.Enemy,
                chance: 100
            }
            ]
        },
        "power whip": {
            name: "Power Whip",
            description: '',
            pp: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Grass,
            power: 120,
            chance: 85,
            effects: [],
        },
        "earthquake": {
            name: "Earthquake",
            description: '',
            pp: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Ground,
            power: 100,
            chance: 100,
            effects: []
        },
        "roost": {
            name: "Roost",
            description: 'Heals up to 50% max health, user loses flying type until end of turn',
            pp: 10,
            damageType: DamageType.Status,
            elementalType: ElementType.Flying,
            power: 0,
            chance: 100,
            effects: [{
                type: 'health-restore',
                restoreType: HealthRestoreType.PercentMaxHealth,
                amount: 50,
                chance: 100
            },
            {
                type: 'inflict-volatile-status',
                status: VolatileStatusType.Roosted,
                target: TargetType.Self,
                chance: 100
            }
            ]
        },
        "focus blast": {
            name: "Focus Blast",
            description: "Has a 10% chance to lower the target's Special Defence by 1 stage",
            damageType: DamageType.Special,
            pp: 10,
            power: 120,
            elementalType: ElementType.Fighting,
            chance: 70,
            effects: [{
                type: 'stat-boost',
                stat: Stat.SpecialDefense,
                target: TargetType.Enemy,
                amount: -1,
                chance: 10
            }]
        },
        "air slash": {
            name: "Air Slash",
            description: 'Has a 30% chance to flinch the target',
            damageType: DamageType.Special,
            pp: 20,
            power: 75,
            elementalType: ElementType.Flying,
            chance: 95,
            effects: [{
                type: 'inflict-volatile-status',
                status: VolatileStatusType.Flinch,
                target: TargetType.Enemy,
                chance: 30
            }]
        },

        "aqua veil": {
            name: "Aqua Veil",
            description: "The pokemon surrounds itself with a veil of water",
            damageType: DamageType.Status,
            pp: 15,
            power: 0,
            elementalType: ElementType.Water,
            chance: 100,
            effects: [{
                type: 'inflict-volatile-status',
                status: VolatileStatusType.AquaRing,
                target: TargetType.Self,
                chance: 100
            }]
        },
        "confuse ray": {
            name: "Confuse Ray",
            description: "A ray that confuses the opponent",
            damageType: DamageType.Status,
            pp: 15,
            power: 0,
            elementalType: ElementType.Normal,
            chance: 100,
            effects: [
                {
                    type: 'inflict-volatile-status',
                    status: VolatileStatusType.Confusion,
                    target: TargetType.Enemy,
                    chance: 100
                }
            ]
        },
        "sleep powder": {
            name: "Sleep Powder",
            description: "The user scatters a big cloud of sleep-inducing dust around the target",
            damageType: DamageType.Status,
            pp: 15,
            power: 0,
            elementalType: ElementType.Grass,
            effects: [
                {
                    type: 'inflict-status',
                    status: Status.Sleep,
                    target: TargetType.Enemy,
                    chance: 100
                }
            ],
            chance: 75
        },
        "will o wisp": {
            name: "will o wisp",
            description: "The user shoots a sinister, bluish-white flame at the target to inflict a burn",
            damageType: DamageType.Status,
            pp: 15,
            power: 0,
            elementalType: ElementType.Fire,
            effects: [
                {

                    type: 'inflict-status',
                    status: Status.Burned,
                    target: TargetType.Enemy,
                    chance: 100
                }
            ],
            chance: 85
        },
        "growl": {
            name: "Growl",
            description: "The user growls at the target",
            damageType: DamageType.Status,
            power: 0,
            chance: 100,
            pp: 20,
            elementalType: ElementType.Normal,
            effects: [
                {
                    type: 'stat-boost',
                    stat: Stat.Attack,
                    target: TargetType.Enemy,
                    amount: -1,
                    chance: 100
                }
            ]
        },
        "swords dance": {
            name: "Swords Dance",
            description: "The user does a dance and increases its attack",
            damageType: DamageType.Status,
            power: 0,
            chance: 100,
            pp: 20,
            elementalType: ElementType.Normal,
            effects: [
                {
                    type: 'stat-boost',
                    stat: Stat.Attack,
                    target: TargetType.Self,
                    amount: 2,
                    chance: 100
                }
            ]
        },
        "poison powder": {
            name: "poison powder",
            description: "The user scatters a cloud of poisonous dust that poisons the target",
            damageType: DamageType.Status,
            pp: 15,
            power: 0,
            elementalType: ElementType.Poison,
            effects: [
                {

                    type: 'inflict-status',
                    status: Status.Poison,
                    target: TargetType.Enemy,
                    chance: 100
                }
            ],
            chance: 75
        },
        "thunder wave": {
            name: "thunder wave",
            description: "The user launches a weak jolt of electricity that paralyzes the target",
            damageType: DamageType.Status,
            pp: 20,
            power: 0,
            elementalType: ElementType.Electric,
            effects: [
                {

                    type: 'inflict-status',
                    status: Status.Paralyzed,
                    target: TargetType.Enemy,
                    chance: 100
                }
            ],
            chance: 85
        },
        "fire blast": {
            name: 'Fire blast',
            description: 'Has a 10% chance to burn the target',
            pp: 10,
            power: 120,
            damageType: DamageType.Special,
            elementalType: ElementType.Fire,
            chance: 85,
            effects: [
                {
                    type: 'inflict-status',
                    status: Status.Burned,
                    target: TargetType.Enemy,
                    chance: 10
                }
            ]
        },
        "fly":
        {
            name: 'Fly',
            description: 'a flying attack',
            pp: 15,
            power: 75,
            chance: 85,
            damageType: DamageType.Physical,
            elementalType: ElementType.Flying
        },
        "hydro pump": {

            name: 'Hydro Pump',
            pp: 10,
            description: 'hydro pumpy action',
            power: 120,
            chance: 85,
            elementalType: ElementType.Water,
            damageType: DamageType.Special,

        },
        "razor leaf": {
            name: 'Razor Leaf',
            description: 'some razory leaves',
            pp: 35,
            power: 65,
            chance: 95,
            damageType: DamageType.Physical,
            elementalType: ElementType.Grass,

        },
        "thunderbolt":{
            name:"Thunderbolt",
            description:'thunderbolt',
            pp:24,
            power:90,
            chance:100,
            elementalType:ElementType.Electric,
            damageType:DamageType.Special,
            effects:[
                {
                    type:'inflict-status',
                    status:Status.Paralyzed,
                    chance:10,
                    target:TargetType.Enemy
                }
            ]

        },
        //should be nasty plot.
        "nasty plot": {
            name: "Nasty Plot",
            description: "The user stimulates its brain by thinking bad thoughts. This sharply raises the user's Sp. Atk stat.",
            damageType: DamageType.Status,
            power: 0,
            chance: 100,
            pp: 20,
            elementalType: ElementType.Dark,
            effects: [
                {
                    type: 'stat-boost',
                    stat: Stat.SpecialAttack,
                    target: TargetType.Self,
                    amount: 2,
                    chance: 100
                }
            ]
        },
        "calm mind":{
            name: "Calm Mind",
            description: "The user quietly focuses its mind and calms its spirit to raise its Sp. Atk and Sp. Def stats.",
            damageType: DamageType.Status,
            power: 0,
            chance: 100,
            pp: 20,
            elementalType: ElementType.Dark,
            effects: [
                {
                    type: 'stat-boost',
                    stat: Stat.SpecialAttack,
                    target: TargetType.Self,
                    amount: 1,
                    chance: 100
                },
                {
                    type:'stat-boost',
                    stat:Stat.SpecialDefense,
                    target:TargetType.Self,
                    amount:1,
                    chance:100
                }
            ]
        },
        "psychic":{
            name:"Psychic",
            description:"The target is hit by a strong telekinetic force. This may also lower the target's Sp. Def stat",
            damageType: DamageType.Special,
            power: 90,
            chance: 100,
            pp: 20,
            elementalType: ElementType.Psychic,
            effects: [
                {
                    type: 'stat-boost',
                    stat: Stat.SpecialDefense,
                    target: TargetType.Enemy,
                    amount: 1,
                    chance: 10
                },

            ]
            
        },
        "shadow ball":{
            name:"Shadow Ball",
            description:"The target is hit by a strong telekinetic force. This may also lower the target's Sp. Def stat",
            damageType: DamageType.Special,
            power: 90,
            chance: 100,
            pp: 20,
            elementalType: ElementType.Ghost,
            effects: [
                {
                    type: 'stat-boost',
                    stat: Stat.SpecialDefense,
                    target: TargetType.Enemy,
                    amount: 1,
                    chance: 10
                },

            ]
            
        },
        "substitute":{
            name:"Substitute",
            description:"The user creates a substitute for itself using some of its HP. The substitute serves as the user's decoy.",
            damageType:DamageType.Status,
            power:0,
            chance:100,
            pp:20,
            elementalType: ElementType.Normal,
            effects:[
                {
                    type:'inflict-volatile-status',
                    status:VolatileStatusType.Substitute,
                    target:TargetType.Self,
                    chance:100
                }
            ]
        }

    }

    const tech = techs[name.toLowerCase()];

    if (tech === undefined) {
        throw new Error(`Could not find technique for name ${name}`)
    }

    //convert to conform to the technique interface.
    return {...tech,...{id:-1,currentPP:tech.pp}};
}

