import { stat } from "fs";
import { DamageEffect, DamageEffectTypes } from "game/DamageEffects/DamageEffects";
import { BattleEffect, TargetType, HealthRestoreType } from "game/Effects/Effects";
import { Status } from "game/HardStatus/HardStatus";
import { Stat } from "game/Stat";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import { ElementType } from "../ElementType";
import { DamageType, Technique } from "./Technique";


export interface BaseTechnique {
    name: string,
    description: string,
    pp: number,
    power: number,
    damageType: DamageType,
    elementalType: ElementType,
    accuracy: number,
    damageEffect?: DamageEffect,
    effects?: Array<BattleEffect>,
}

export function GetTech(name: string):Technique {

    const techs: Array<BaseTechnique> = [
        {
            name:"Ice Punch",
            description:"The target is punched with an icy fist. It may also leave the target frozen.",
            pp:24,
            power:75,
            accuracy:100,
            damageType:DamageType.Physical,
            elementalType:ElementType.Ice,
            effects:[{
                type:'inflict-status',
                status:Status.Frozen,
                target:TargetType.Enemy,
                chance:10
            }]
        },
        {
            name:"Crunch",
            description:"The user crunches up the target with sharp fangs. It may also lower the target's Defense stat.",
            pp:24,
            power:80,
            accuracy:100,
            damageType:DamageType.Physical,
            elementalType:ElementType.Dark,
            effects:[{
                type:'stat-boost',
                target:TargetType.Enemy,
                stat:Stat.Defense,
                amount:-1,
                chance:20
            }]
        },
        {
            name:"Waterfall",
            description:"The user charges at the target and may make it flinch. This can also be used to climb a waterfall.",
            pp:24,
            power:80,
            accuracy:100,
            damageType:DamageType.Physical,
            elementalType:ElementType.Water,
            effects: [{
                type: 'inflict-volatile-status',
                status: VolatileStatusType.Flinch,
                target: TargetType.Enemy,
                chance: 20
            }]  
        },
        {
            name:"Dragon Dance",
            description:"The user vigorously performs a mystic, powerful dance that boosts its Attack and Speed stats.",
            pp:32,
            power:0,
            accuracy:100,
            damageType:DamageType.Status,
            elementalType:ElementType.Dragon,
            effects:[
                {
                    type: 'stat-boost',
                    stat: Stat.Attack,
                    target: TargetType.Self,
                    amount: 1,
                    chance: 100
                },
                {
                    type: 'stat-boost',
                    stat: Stat.Speed,
                    target: TargetType.Self,
                    amount: 1,
                    chance: 100
                }
            ]
        },
        {
            name:"Hidden Power (Grass)",
            description:"A unique attack that varies in type depending on the Pokémon using it",
            pp:24,
            power:60,
            accuracy:100,
            damageType:DamageType.Special,    
            elementalType:ElementType.Grass  
        },
        {
            name:"Eruption",
            description:"The user attacks opposing Pokémon with explosive fury. The lower the user's HP, the lower the move's power.",
            pp:8,
            power:150,
            accuracy:100,
            damageType:DamageType.Physical,
            elementalType:ElementType.Fire,
            damageEffect:{
                type:DamageEffectTypes.Eruption
            }
        },
        {
            name: "Synthesis",
            description: "The user restores its own HP. The amount of HP regained varies with the weather.",
            pp: 8,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Grass,
            accuracy: 100,
            effects: [{
                type: 'health-restore',
                target: TargetType.Self,
                restoreType: HealthRestoreType.PercentMaxHealth,
                amount: 50,
                chance: 100
            }]
        },
        {
            name: "Aromatherapy",
            description: "The user releases a soothing scent that heals all status conditions affecting the user's party.",
            pp: 8,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Grass,
            accuracy: 100,
            effects: [{
                type: "aromatherapy"
            }]
        },
        {
            name: "Giga Drain",
            description: "A nutrient-draining attack. The user's HP is restored by half the damage taken by the target.",
            pp: 16,
            power: 75,
            damageType: DamageType.Special,
            elementalType: ElementType.Grass,
            accuracy: 100,
            effects: [{
                type: 'drain',
                amount: 50,
            }]
        },
        {
            name: "Ice Beam",
            description: '',
            pp: 16,
            power: 90,
            damageType: DamageType.Special,
            elementalType: ElementType.Ice,
            accuracy: 100,
            effects: [{
                type: 'inflict-status',
                status: Status.Frozen,
                chance: 10,
                target: TargetType.Enemy
            }
            ]
        },
        {
            name: "Surf",
            description: '',
            pp: 16,
            power: 90,
            damageType: DamageType.Special,
            elementalType: ElementType.Water,
            accuracy: 100,
            effects: [],
        },
        {
            name: "Rest",
            description: '',
            pp: 16,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Normal,
            accuracy: 100,
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
        {
            name: "Toxic",
            description: '',
            pp: 16,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Poison,
            accuracy: 90,
            effects: [{
                type: 'inflict-status',
                status: Status.ToxicPoison,
                target: TargetType.Enemy,
                chance: 100
            }
            ]
        },
        {
            name: "Power Whip",
            description: '',
            pp: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Grass,
            power: 120,
            accuracy: 85,
            effects: [],
        },
        {
            name: "Earthquake",
            description: '',
            pp: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Ground,
            power: 100,
            accuracy: 100,
            effects: []
        },
        {
            name: "Roost",
            description: 'Heals up to 50% max health, user loses flying type until end of turn',
            pp: 10,
            damageType: DamageType.Status,
            elementalType: ElementType.Flying,
            power: 0,
            accuracy: 100,
            effects: [{
                type: 'health-restore',
                target: TargetType.Self,
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
        {
            name: "Focus Blast",
            description: "Has a 10% chance to lower the target's Special Defence by 1 stage",
            damageType: DamageType.Special,
            pp: 10,
            power: 120,
            elementalType: ElementType.Fighting,
            accuracy: 70,
            effects: [{
                type: 'stat-boost',
                stat: Stat.SpecialDefense,
                target: TargetType.Enemy,
                amount: -1,
                chance: 10
            }]
        },
        {
            name: "Air Slash",
            description: 'Has a 30% chance to flinch the target',
            damageType: DamageType.Special,
            pp: 20,
            power: 75,
            elementalType: ElementType.Flying,
            accuracy: 95,
            effects: [{
                type: 'inflict-volatile-status',
                status: VolatileStatusType.Flinch,
                target: TargetType.Enemy,
                chance: 30
            }]
        },

        {
            name: "Aqua Veil",
            description: "The pokemon surrounds itself with a veil of water",
            damageType: DamageType.Status,
            pp: 15,
            power: 0,
            elementalType: ElementType.Water,
            accuracy: 100,
            effects: [{
                type: 'inflict-volatile-status',
                status: VolatileStatusType.AquaRing,
                target: TargetType.Self,
                chance: 100
            }]
        },
        {
            name: "Confuse Ray",
            description: "A ray that confuses the opponent",
            damageType: DamageType.Status,
            pp: 15,
            power: 0,
            elementalType: ElementType.Normal,
            accuracy: 100,
            effects: [
                {
                    type: 'inflict-volatile-status',
                    status: VolatileStatusType.Confusion,
                    target: TargetType.Enemy,
                    chance: 100
                }
            ]
        },
        {
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
            accuracy: 75
        },
        {
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
            accuracy: 85
        },
        {
            name: "Growl",
            description: "The user growls at the target",
            damageType: DamageType.Status,
            power: 0,
            accuracy: 100,
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
        {
            name: "Swords Dance",
            description: "The user does a dance and increases its attack",
            damageType: DamageType.Status,
            power: 0,
            accuracy: 100,
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
        {
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
            accuracy: 75
        },
        {
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
            accuracy: 85
        },
        {
            name: 'Fire blast',
            description: 'Has a 10% chance to burn the target',
            pp: 10,
            power: 120,
            damageType: DamageType.Special,
            elementalType: ElementType.Fire,
            accuracy: 85,
            effects: [
                {
                    type: 'inflict-status',
                    status: Status.Burned,
                    target: TargetType.Enemy,
                    chance: 10
                }
            ]
        },

        {
            name: 'Fly',
            description: 'a flying attack',
            pp: 15,
            power: 75,
            accuracy: 85,
            damageType: DamageType.Physical,
            elementalType: ElementType.Flying
        },
        {

            name: 'Hydro Pump',
            pp: 10,
            description: 'hydro pumpy action',
            power: 120,
            accuracy: 85,
            elementalType: ElementType.Water,
            damageType: DamageType.Special,

        },
        {
            name: 'Razor Leaf',
            description: 'some razory leaves',
            pp: 35,
            power: 65,
            accuracy: 95,
            damageType: DamageType.Physical,
            elementalType: ElementType.Grass,

        },
        {
            name: "Thunderbolt",
            description: 'thunderbolt',
            pp: 24,
            power: 90,
            accuracy: 100,
            elementalType: ElementType.Electric,
            damageType: DamageType.Special,
            effects: [
                {
                    type: 'inflict-status',
                    status: Status.Paralyzed,
                    chance: 10,
                    target: TargetType.Enemy
                }
            ]

        },
        //should be nasty plot.
        {
            name: "Nasty Plot",
            description: "The user stimulates its brain by thinking bad thoughts. This sharply raises the user's Sp. Atk stat.",
            damageType: DamageType.Status,
            power: 0,
            accuracy: 100,
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
        {
            name: "Calm Mind",
            description: "The user quietly focuses its mind and calms its spirit to raise its Sp. Atk and Sp. Def stats.",
            damageType: DamageType.Status,
            power: 0,
            accuracy: 100,
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
                    type: 'stat-boost',
                    stat: Stat.SpecialDefense,
                    target: TargetType.Self,
                    amount: 1,
                    chance: 100
                }
            ]
        },
        {
            name: "Psychic",
            description: "The target is hit by a strong telekinetic force. This may also lower the target's Sp. Def stat",
            damageType: DamageType.Special,
            power: 90,
            accuracy: 100,
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
        {
            name: "Sludge Wave",
            description: "The user strikes everything around it by swamping the area with a giant sludge wave. This may also poison those hit.",
            damageType: DamageType.Special,
            power: 95,
            accuracy: 100,
            elementalType: ElementType.Poison,
            pp: 16,
            effects: [
                {
                    type: 'inflict-status',
                    status: Status.Poison,
                    target: TargetType.Enemy,
                    chance: 10
                }
            ]

        },
        {
            name: "Shadow Ball",
            description: "The target is hit by a strong telekinetic force. This may also lower the target's Sp. Def stat",
            damageType: DamageType.Special,
            power: 90,
            accuracy: 100,
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
        {
            name: "Substitute",
            description: "The user creates a substitute for itself using some of its HP. The substitute serves as the user's decoy.",
            damageType: DamageType.Status,
            power: 0,
            accuracy: 100,
            pp: 20,
            elementalType: ElementType.Normal,
            effects: [
                {
                    type: 'inflict-volatile-status',
                    status: VolatileStatusType.Substitute,
                    target: TargetType.Self,
                    chance: 100
                }
            ]
        }

    ]

    const tech = techs.find(t => t.name.toLowerCase().trim() === name.toLowerCase().trim())

    if (tech === undefined) {
        throw new Error(`Could not find technique for name ${name}`)
    }

    //convert to conform to the technique interface.
    return { ...tech, ...{ id: -1, currentPP: tech.pp } };
}

