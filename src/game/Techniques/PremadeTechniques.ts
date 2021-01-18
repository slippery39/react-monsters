
import { DamageEffect, DamageEffectTypes } from "game/DamageEffects/DamageEffects";
import { BattleEffect, TargetType, HealthRestoreType, EffectType } from "game/Effects/Effects";
import { EntryHazardType } from "game/EntryHazards/EntryHazard";
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
    accuracy?: number,
    priority?: number,
    damageEffect?: DamageEffect,
    makesContact?: boolean,
    effects?: Array<BattleEffect>,
}

export function GetTech(name: string): Technique {

    const techs: Array<BaseTechnique> = [
        {
            name:"Hidden Power Rock",
            description:"An attack that varies in type and intensity depending on the user.",
            pp:24,
            power:60,
            accuracy:100,
            damageType:DamageType.Special,
            elementalType:ElementType.Rock,            
        },
        {
            name: "Coil",
            description: "The user coils up and concentrates. This raises its Attack and Defense stats as well as its accuracy.",
            pp: 32,
            power: 0,
            accuracy: 100,
            damageType: DamageType.Status,
            elementalType: ElementType.Poison,
            effects: [
                {
                    type: EffectType.StatBoost,
                    stat: Stat.Attack,
                    chance: 100,
                    amount: 1,
                    target: TargetType.Self
                },
                {
                    type: EffectType.StatBoost,
                    stat: Stat.Defense,
                    chance: 100,
                    amount: 1,
                    target: TargetType.Self
                },
                {
                    type: EffectType.StatBoost,
                    stat: Stat.Accuracy,
                    chance: 100,
                    amount: 1,
                    target: TargetType.Self
                }
            ]
        },
        {
            name: "Headbutt",
            description: "The user sticks out its head and attacks by charging straight into the target. It may also make the target flinch.",
            pp: 24,
            power: 70,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Normal,
            makesContact: true,
            effects: [{
                type: EffectType.InflictVolatileStatus,
                status: VolatileStatusType.Flinch,
                chance: 30,
                target: TargetType.Enemy
            }]
        },
        {
            name: "Glare",
            description: "The user intimidates the target with the pattern on its belly to cause paralysis.",
            pp: 48,
            power: 0,
            elementalType: ElementType.Normal,
            accuracy: 90,
            damageType: DamageType.Status,
            effects: [{
                type: EffectType.InflictStatus,
                status: Status.Paralyzed,
                chance: 100,
                target: TargetType.Enemy
            }]
        },
        {
            name: "Rapid Spin",
            description: "A spin attack that can also eliminate such moves as Bind, Wrap, Leech Seed, and Spikes.",
            pp: 64,
            power: 50,
            elementalType: ElementType.Normal,
            accuracy: 100,
            damageType: DamageType.Physical,
            makesContact: true,
            effects: [{
                type: EffectType.ClearHazards,
                target: TargetType.Enemy,
                chance: 100
            },
            {
                type: EffectType.StatBoost,
                target: TargetType.Self,
                stat: Stat.Speed,
                amount: 1,
                chance: 100
            },
            ]
        },
        {
            name: "Protect",
            description: "Enables the user to evade all attacks. Its chance of failing rises if it is used in succession.",
            pp: 16,
            priority: 4,
            elementalType: ElementType.Normal,
            power: 0,
            damageType: DamageType.Status,
            accuracy: 100,
            effects: [{
                type: EffectType.InflictVolatileStatus,
                status: VolatileStatusType.Protection,
                target: TargetType.Self,
                chance: 100
            }]
        },
        {
            name: "Stealth Rock",
            description: "The user lays a trap of levitating stones around the opposing team. The trap hurts opposing Pokémon that switch into battle.",
            pp: 32,
            power: 0,
            accuracy: 100,
            damageType: DamageType.Status,
            elementalType: ElementType.Rock,
            effects: [{
                type: EffectType.PlaceEntryHazard,
                hazard: EntryHazardType.StealthRock
            }]
        },
        {
            name: "Seismic Toss",
            description: "The target is thrown using the power of gravity. It inflicts damage equal to the user's level.",
            pp: 32,
            power: 0,
            accuracy: 100,
            damageType: DamageType.Physical,
            makesContact: true,
            elementalType: ElementType.Fighting,
            damageEffect: {
                type: DamageEffectTypes.SeismicToss
            }
        },
        {
            name: "Soft Boiled",
            description: "The user restores its own HP by up to half of its max HP.",
            accuracy: 100,
            pp: 16,
            power: 0,
            elementalType: ElementType.Normal,
            damageType: DamageType.Status,
            effects: [{
                type: EffectType.HealthRestore,
                restoreType: HealthRestoreType.PercentMaxHealth,
                target: TargetType.Self,
                amount: 50
            }]
        },
        {
            name: "Whirlwind",
            description: "The target is blown away, and a different Pokémon is dragged out. In the wild, this ends a battle against a single Pokémon",
            accuracy: 100,
            priority: -6,
            pp: 32,
            power: 0,
            elementalType: ElementType.Normal,
            damageType: DamageType.Status,
            effects: [{
                type: EffectType.Whirlwind
            }]
        },
        {
            name: "Spikes",
            description: "The user lays a trap of spikes at the opposing team's feet. The trap hurts Pokémon that switch into battle.",
            accuracy: 100,
            pp: 32,
            power: 0,
            elementalType: ElementType.Ground,
            damageType: DamageType.Status,
            effects: [{
                type: EffectType.PlaceEntryHazard,
                hazard: EntryHazardType.Spikes
            }]
        },
        {
            name: "Iron Head",
            description: "The user slams the target with its steel-hard head. This may also make the target flinch.",
            accuracy: 100,
            pp: 24,
            power: 80,
            elementalType: ElementType.Steel,
            damageType: DamageType.Physical,
            makesContact: true,
            effects: [{
                type: EffectType.InflictVolatileStatus,
                status: VolatileStatusType.Flinch,
                target: TargetType.Enemy,
                chance: 30
            }]
        },
        {
            name: "Volt Switch",
            description: "[Description Needed]",
            accuracy: 100,
            pp: 24,
            power: 70,
            elementalType: ElementType.Electric,
            damageType: DamageType.Special,
            effects: [{
                type: EffectType.SwitchPokemon,
                chance: 100
            }]
        },

        {
            name: "Heal Bell",
            description: "The user makes a soothing bell chime to heal the status problems of all the party Pokémon.",
            pp: 8,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Normal,
            accuracy: 100,
            effects: [{
                type: EffectType.Aromatherapy
            }]
        },

        {
            name: "Ice Punch",
            description: "The target is punched with an icy fist. It may also leave the target frozen.",
            pp: 24,
            power: 75,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Ice,
            makesContact: true,
            effects: [{
                type: EffectType.InflictStatus,
                status: Status.Frozen,
                target: TargetType.Enemy,
                chance: 10
            }]
        },
        {
            name: "Crunch",
            description: "The user crunches up the target with sharp fangs. It may also lower the target's Defense stat.",
            pp: 24,
            power: 80,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Dark,
            makesContact: true,
            effects: [{
                type: EffectType.StatBoost,
                target: TargetType.Enemy,
                stat: Stat.Defense,
                amount: -1,
                chance: 20
            }]
        },
        {
            name: "Waterfall",
            description: "The user charges at the target and may make it flinch. This can also be used to climb a waterfall.",
            pp: 24,
            power: 80,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Water,
            makesContact: true,
            effects: [{
                type: EffectType.InflictVolatileStatus,
                status: VolatileStatusType.Flinch,
                target: TargetType.Enemy,
                chance: 20
            }]
        },
        {
            name: "Dragon Dance",
            description: "The user vigorously performs a mystic, powerful dance that boosts its Attack and Speed stats.",
            pp: 32,
            power: 0,
            accuracy: 100,
            damageType: DamageType.Status,
            elementalType: ElementType.Dragon,
            effects: [
                {
                    type: EffectType.StatBoost,
                    stat: Stat.Attack,
                    target: TargetType.Self,
                    amount: 1,
                    chance: 100
                },
                {
                    type: EffectType.StatBoost,
                    stat: Stat.Speed,
                    target: TargetType.Self,
                    amount: 1,
                    chance: 100
                }
            ]
        },
        {
            name: "Hidden Power (Grass)",
            description: "A unique attack that varies in type depending on the Pokémon using it",
            pp: 24,
            power: 60,
            accuracy: 100,
            damageType: DamageType.Special,
            elementalType: ElementType.Grass
        },
        {
            name: "Eruption",
            description: "The user attacks opposing Pokémon with explosive fury. The lower the user's HP, the lower the move's power.",
            pp: 8,
            power: 150,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Fire,
            damageEffect: {
                type: DamageEffectTypes.Eruption
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
                type: EffectType.HealthRestore,
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
                type: EffectType.Aromatherapy
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
                type: EffectType.Drain,
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
                type: EffectType.InflictStatus,
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
                type: EffectType.StatusRestore,
                forStatus: 'any',
                target: TargetType.Self,
                chance: 100
            },
            {
                type: EffectType.HealthRestore,
                restoreType: HealthRestoreType.PercentMaxHealth,
                target: TargetType.Self,
                amount: 100,
                chance: 100
            },
            {
                type: EffectType.InflictStatus,
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
                type: EffectType.InflictStatus,
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
            makesContact: true
        },
        {
            name: "Earthquake",
            description: '',
            pp: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Ground,
            power: 100,
            accuracy: 100,
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
                type: EffectType.HealthRestore,
                target: TargetType.Self,
                restoreType: HealthRestoreType.PercentMaxHealth,
                amount: 50,
                chance: 100
            },
            {
                type: EffectType.InflictVolatileStatus,
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
                type: EffectType.StatBoost,
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
                type: EffectType.InflictVolatileStatus,
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
                type: EffectType.InflictVolatileStatus,
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
                    type: EffectType.InflictVolatileStatus,
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
                    type: EffectType.InflictStatus,
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

                    type: EffectType.InflictStatus,
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
                    type: EffectType.StatBoost,
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
                    type: EffectType.StatBoost,
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

                    type: EffectType.InflictStatus,
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

                    type: EffectType.InflictStatus,
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
                    type: EffectType.InflictStatus,
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
            makesContact: true,
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
                    type: EffectType.InflictStatus,
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
                    type: EffectType.StatBoost,
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
            elementalType: ElementType.Psychic,
            effects: [
                {
                    type: EffectType.StatBoost,
                    stat: Stat.SpecialAttack,
                    target: TargetType.Self,
                    amount: 1,
                    chance: 100
                },
                {
                    type: EffectType.StatBoost,
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
                    type: EffectType.StatBoost,
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
                    type: EffectType.InflictStatus,
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
                    type: EffectType.StatBoost,
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
                    type: EffectType.InflictVolatileStatus,
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
    return { ...tech, ...{ id: -1, currentPP: tech.pp, accuracy: tech.accuracy ? tech.accuracy : 100 } };
}

