import { Status } from "game/HardStatus/HardStatus";
import { Stat } from "game/Stat";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import { ElementType } from "../interfaces";
import { DamageType, HealthRestoreType, TargetType, Technique, TechniqueEffectType } from "./Technique";



interface PremadeTechniques {
    [key: string]: Technique
}



export function GetTech(name: string) {

    const techs: PremadeTechniques = {
        "toxic": {
            id: -1,
            name: "Toxic",
            description: '',
            pp: 16,
            currentPP: 16,
            power:0,
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
            id: -1,
            name: "Power Whip",
            description: '',
            pp: 16,
            currentPP: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Grass,
            power: 120,
            chance: 85,
            effects: [],
        },
        "earthquake": {
            id: -1,
            name: "Earthquake",
            description: '',
            pp: 16,
            currentPP: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Ground,
            power: 100,
            chance: 100,
            effects: []
        },
        "roost": {
            id: -1,
            name: "Roost",
            description: 'Heals up to 50% max health, user loses flying type until end of turn',
            pp: 10,
            currentPP: 10,
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
            id: -1,
            name: "Focus Blast",
            description: "Has a 10% chance to lower the target's Special Defence by 1 stage",
            damageType: DamageType.Special,
            pp: 10,
            currentPP: 10,
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
            id: -1,
            name: "Air Slash",
            description: 'Has a 30% chance to flinch the target',
            damageType: DamageType.Special,
            pp: 20,
            currentPP: 20,
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
            id: -1,
            name: "Aqua Veil",
            description: "The pokemon surrounds itself with a veil of water",
            damageType: DamageType.Status,
            pp: 15,
            currentPP: 15,
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
            id: -1,
            name: "Confuse Ray",
            description: "A ray that confuses the opponent",
            damageType: DamageType.Status,
            pp: 15,
            currentPP: 15,
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
            id: -1,
            name: "Sleep Powder",
            description: "The user scatters a big cloud of sleep-inducing dust around the target",
            damageType: DamageType.Status,
            pp: 15,
            currentPP: 15,
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
            id: -1,
            name: "will o wisp",
            description: "The user shoots a sinister, bluish-white flame at the target to inflict a burn",
            damageType: DamageType.Status,
            pp: 15,
            currentPP: 15,
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
            id: -1,
            name: "Growl",
            description: "The user growls at the target",
            damageType: DamageType.Status,
            power: 0,
            chance: 100,
            pp: 20,
            currentPP: 20,
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
            id: -1,
            name: "Swords Dance",
            description: "The user does a dance and increases its attack",
            damageType: DamageType.Status,
            power: 0,
            chance: 100,
            pp: 20,
            currentPP: 20,
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
            id: -1,
            name: "poison powder",
            description: "The user scatters a cloud of poisonous dust that poisons the target",
            damageType: DamageType.Status,
            pp: 15,
            currentPP: 15,
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
            id: -1,
            name: "thunder wave",
            description: "The user launches a weak jolt of electricity that paralyzes the target",
            damageType: DamageType.Status,
            pp: 20,
            power: 0,
            currentPP: 20,
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
            id: 1,
            name: 'Fire blast',
            description: 'Has a 10% chance to burn the target',
            pp: 10,
            currentPP: 10,
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
            id: 2,
            name: 'Fly',
            description: 'a flying attack',
            pp: 15,
            currentPP: 15,
            power: 75,
            chance: 85,
            damageType: DamageType.Physical,
            elementalType: ElementType.Flying
        },
        "hydro pump": {

            id: 3,
            name: 'Hydro Pump',
            pp: 10,
            description: 'hydro pumpy action',
            currentPP: 10,
            power: 120,
            chance: 85,
            elementalType: ElementType.Water,
            damageType: DamageType.Special,

        },
        "razor leaf": {
            id: 5,
            name: 'Razor Leaf',
            description: 'some razory leaves',
            pp: 35,
            currentPP: 35,
            power: 65,
            chance: 95,
            damageType: DamageType.Physical,
            elementalType: ElementType.Grass,

        }

    }

    const tech = techs[name.toLowerCase()];

    if (tech === undefined) {
        throw new Error(`Could not find technique for name ${name}`)
    }
    return techs[name.toLowerCase()];
}

