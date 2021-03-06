
import { DamageEffect, DamageEffectTypes } from "game/DamageEffects/DamageEffects";
import { BattleEffect, TargetType, HealthRestoreType, EffectType, RecoilDamageType } from "game/Effects/Effects";
import { EntryHazardType } from "game/EntryHazards/EntryHazard";
import { FieldEffectType } from "game/FieldEffects/FieldEffects";
import { Status } from "game/HardStatus/HardStatus";
import { Stat } from "game/Stat";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import { WeatherType } from "game/Weather/Weather";
import { ElementType } from "../ElementType";
import { DamageType } from "./Technique";


export interface BaseTechnique {
    name: string,
    description: string,
    pp: number,
    power: number,
    damageType: DamageType,
    elementalType: ElementType,
    critChanceStage?: number,
    accuracy?: number,
    priority?: number,
    beforeExecuteEffect?: BattleEffect,
    damageEffect?: DamageEffect,
    makesContact?: boolean,
    effects?: Array<BattleEffect>,
    twoTurnMove?: boolean,
    firstTurnStatus?: VolatileStatusType
}

function CreateHiddenPower(elementType: ElementType) {
    let name = elementType.toLowerCase();
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return {
        name: "Hidden Power " + name,
        description: "An attack that varies in type and intensity depending on the user.",
        pp: 24,
        power: 60,
        accuracy: 100,
        damageType: DamageType.Special,
        elementalType: elementType
    }
}

function CreateAllHiddenPowers() {
    const elementTypes = Object.values(ElementType);

    const powers = elementTypes.map(ele => {
        return CreateHiddenPower(ele);
    });

    return powers;
}


export function GetTech(name: string) {
    const techs: Array<BaseTechnique> = [
        {
            name:"Acid Spray",
            description:"The user spits fluid that works to melt the target. This harshly lowers the target's Sp. Def stat.",
            pp:32,
            power:40,
            accuracy:100,
            damageType:DamageType.Special,
            elementalType:ElementType.Poison,
            effects:[{
                type:EffectType.StatBoost,
                stat:Stat.SpecialDefense,
                amount:-2,
                target:TargetType.Enemy
            }]
        },
        {
            name:"Toxic Spikes",
            description:"The user lays a trap of poison spikes at the feet of the opposing team. The spikes will poison opposing Pokémon that switch into battle.",
            pp:32,
            power:0,
            accuracy:100,
            damageType:DamageType.Status,
            elementalType:ElementType.Poison,
            effects:[{
                type:EffectType.PlaceEntryHazard,
                hazard:EntryHazardType.ToxicSpikes
            }]
        },
        {
            name: "Slack Off",
            description: "The user slacks off, restoring its own HP by up to half of its max HP.",
            pp: 10,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Normal,
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
            name:"Bug Buzz",
            description:"The user generates a damaging sound wave by vibration. This may also lower the target's Sp. Def stat.",
            damageType:DamageType.Special,
            power:90,
            accuracy:100,
            pp:16,
            elementalType:ElementType.Bug,
            effects:[
                {
                    type:EffectType.StatBoost,
                    stat:Stat.SpecialDefense,
                    target:TargetType.Enemy,
                    amount:-1,
                    chance:100
                }
            ]
        },
        {
            name: "Quiver Dance",
            description: "The user lightly performs a beautiful, mystic dance. This boosts the user's Sp. Atk, Sp. Def, and Speed stats.",
            damageType: DamageType.Status,
            power: 0,
            accuracy: 100,
            pp: 20,
            elementalType: ElementType.Bug,
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
            name: "Psyshock",
            description: "The user materializes an odd psychic wave to attack the target. This attack does physical damage.",
            power: 80,
            pp: 16,
            damageType: DamageType.Special,
            elementalType: ElementType.Psychic,
            accuracy: 100,
            damageEffect: { type: DamageEffectTypes.Psyshock }
        },
        {
            name: "Lovely Kiss",
            description: "With a scary face, the user tries to force a kiss on the target. If it succeeds, the target falls asleep.",
            power: 0,
            accuracy: 75,
            damageType: DamageType.Status,
            elementalType: ElementType.Normal,
            pp: 16,
            effects: [
                {
                    type: EffectType.InflictStatus,
                    status: Status.Sleep,
                    chance: 100,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Dynamic Punch",
            description: "The user punches the target with full, concentrated power. This confuses the target if it hits.",
            power: 100,
            accuracy: 50,
            pp: 8,
            elementalType: ElementType.Fighting,
            damageType: DamageType.Physical,
            makesContact: true,
            effects: [
                {
                    type: EffectType.InflictVolatileStatus,
                    status: VolatileStatusType.Confusion,
                    chance: 100,
                    target: TargetType.Enemy
                }
            ]
        },
        ...CreateAllHiddenPowers(),
        {
            name: "Double Edge",
            description: "A reckless, life-risking tackle. This also damages the user quite a lot.",
            power: 120,
            accuracy: 100,
            pp: 24,
            elementalType: ElementType.Normal,
            damageType: DamageType.Physical,
            makesContact: true,
            effects: [
                {
                    type: EffectType.Recoil,
                    recoilType: RecoilDamageType.PercentDamageDealt,
                    amount: 33.33
                }
            ]
        },
        {
            name: "Quick Attack",
            description: "The user lunges at the target at a speed that makes it almost invisible. It is sure to strike first.",
            power: 40,
            accuracy: 100,
            priority: 1,
            pp: 48,
            damageType: DamageType.Physical,
            makesContact: true,
            elementalType: ElementType.Normal
        },
        {
            name: "Taunt",
            description: "The target is taunted into a rage that allows it to use only attack moves for three turns.",
            power: 0,
            pp: 24,
            damageType: DamageType.Status,
            elementalType: ElementType.Dark,
            effects: [
                {
                    type: EffectType.InflictVolatileStatus,
                    status: VolatileStatusType.Taunted,
                    chance: 100,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Lava Plume",
            description: "The user torches everything around it in an inferno of scarlet flames. This may also leave those it hits with a burn.",
            power: 80,
            pp: 24,
            damageType: DamageType.Special,
            elementalType: ElementType.Fire,
            effects: [
                {
                    type: EffectType.InflictStatus,
                    status: Status.Burned,
                    chance: 30,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Shadow Claw",
            description: "The user slashes with a sharp claw made from shadows. Critical hits land more easily.",
            power: 70,
            pp: 24,
            damageType: DamageType.Physical,
            makesContact: true,
            elementalType: ElementType.Ghost,
            accuracy: 100
        },
        {
            name: "Aerial Ace",
            description: "The user confounds the target with speed, then slashes. This attack never misses.",
            power: 60,
            pp: 32,
            damageType: DamageType.Physical,
            elementalType: ElementType.Flying,
            accuracy: 99999
        },
        {
            name: "Fire Fang",
            description: "The user bites with flame-cloaked fangs. This may also make the target flinch or leave it with a burn.",
            power: 65,
            accuracy: 95,
            pp: 24,
            damageType: DamageType.Physical,
            elementalType: ElementType.Fire,
            effects: [
                {
                    type: EffectType.InflictStatus,
                    status: Status.Burned,
                    chance: 10,
                    target: TargetType.Enemy
                },
                {
                    type: EffectType.InflictVolatileStatus,
                    status: VolatileStatusType.Flinch,
                    chance: 10,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Curse",
            description: "Raises Attack and Defense at the expense of Speed. It works differently for the Ghost type.",
            power: 0,
            accuracy: 9999,
            pp: 16,
            damageType: DamageType.Status,
            elementalType: ElementType.Ghost,
            effects: [
                {
                    type: EffectType.StatBoost,
                    amount: -1,
                    stat: Stat.Speed,
                    target: TargetType.Self
                },
                {
                    type: EffectType.StatBoost,
                    amount: 1,
                    stat: Stat.Attack,
                    target: TargetType.Self
                },
                {
                    type: EffectType.StatBoost,
                    amount: 1,
                    stat: Stat.Defense,
                    target: TargetType.Self
                },
            ]
        },
        {
            name: "Return",
            description: "This full-power attack grows more powerful the more the user likes its Trainer.",
            power: 102,
            accuracy: 100,
            pp: 32,
            damageType: DamageType.Physical,
            makesContact: true,
            elementalType: ElementType.Normal,
        },
        {
            name: "Hurricane",
            description: "The user attacks by wrapping its opponent in a fierce wind that flies up into the sky. This may also confuse the target.",
            pp: 16,
            power: 110,
            accuracy: 70,
            damageType: DamageType.Special,
            elementalType: ElementType.Flying,
            effects: [
                {
                    type: EffectType.InflictVolatileStatus,
                    target: TargetType.Enemy,
                    status: VolatileStatusType.Confusion,
                    chance: 30
                }
            ]
        },
        {
            name: "Defog",
            description: "A strong wind blows away the target's barriers such as Reflect or Light Screen. This also lowers the target's evasiveness.",
            pp: 24,
            power: 0,
            accuracy: 99999,
            damageType: DamageType.Status,
            elementalType: ElementType.Flying,
            effects: [
                {
                    type: EffectType.ClearHazards,
                    target: TargetType.Enemy
                },
                {
                    type: EffectType.ClearHazards,
                    target: TargetType.Self
                },
                //should be reducing enemy evasiveness, but i don't really care at the moment for programming that in.
                {
                    type: EffectType.StatBoost,
                    target: TargetType.Self,
                    stat: Stat.Accuracy,
                    amount: 1
                }
            ]
        },
        {
            name: "Rock Slide",
            description: "Large boulders are hurled at opposing Pokémon to inflict damage. This may also make the opposing Pokémon flinch.",
            pp: 16,
            power: 75,
            elementalType: ElementType.Rock,
            damageType: DamageType.Physical,
            effects: [
                {
                    type: EffectType.InflictVolatileStatus,
                    status: VolatileStatusType.Flinch,
                    chance: 30,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Solar Beam",
            description: "In this two-turn attack, the user gathers light, then blasts a bundled beam on the next turn.",
            pp: 16,
            power: 120,
            elementalType: ElementType.Grass,
            damageType: DamageType.Special,
            twoTurnMove: true,
            firstTurnStatus: VolatileStatusType.ChargingSolarBeam
        },
        {
            name: "Sunny Day",
            description: "The user intensifies the sun for five turns, powering up Fire-type moves. It lowers the power of Water-type moves.",
            pp: 8,
            power: 0,
            elementalType: ElementType.Fire,
            damageType: DamageType.Status,
            effects: [
                {
                    type: EffectType.ApplyWeather,
                    weather: WeatherType.Sunny
                }
            ]
        },
        {
            name: "Sticky Web",
            description: "The user weaves a sticky net around the opposing team, which lowers their Speed stat upon switching into battle.",
            pp: 32,
            power: 0,
            damageType: DamageType.Status,
            elementalType: ElementType.Bug,
            effects: [
                {
                    type: EffectType.PlaceEntryHazard,
                    hazard: EntryHazardType.StickyWeb
                }
            ]
        },
        {
            name: "Stone Edge",
            description: "The user stabs the target from below with sharpened stones. Critical hits land more easily.",
            pp: 8,
            power: 100,
            accuracy: 80,
            damageType: DamageType.Physical,
            elementalType: ElementType.Rock,
            critChanceStage: 1
        },
        {
            name: "Zen Headbutt",
            description: "The user focuses its willpower to its head and rams the foe. It may also make the target flinch.",
            pp: 24,
            power: 80,
            accuracy: 90,
            elementalType: ElementType.Psychic,
            damageType: DamageType.Physical,
            makesContact: true,
            effects: [{
                type: EffectType.InflictVolatileStatus,
                status: VolatileStatusType.Flinch,
                target: TargetType.Enemy,
                chance: 20
            }]
        },
        {
            name: "Leaf Storm",
            description: "A storm of sharp leaves is whipped up. The attack's recoil sharply reduces the user's Sp. Atk stat.",
            pp: 8,
            power: 130,
            accuracy: 90,
            elementalType: ElementType.Grass,
            damageType: DamageType.Special,
            effects: [{
                type: EffectType.StatBoost,
                stat: Stat.SpecialAttack,
                amount: -2,
                target: TargetType.Self
            }]
        },
        {
            name: "Moonblast",
            description: "Borrowing the power of the moon, the user attacks the target. This may also lower the target's Sp. Atk stat.",
            pp: 24,
            power: 95,
            accuracy: 100,
            damageType: DamageType.Special,
            elementalType: ElementType.Fairy,
            effects: [
                {
                    type: EffectType.StatBoost,
                    stat: Stat.SpecialAttack,
                    amount: -1,
                    target: TargetType.Enemy,
                    chance: 30
                }
            ]
        },
        {
            name: "Earth Power",
            description: "The user makes the ground under the foe erupt with power. It may also lower the target's Sp. Def.",
            pp: 16,
            power: 90,
            accuracy: 100,
            damageType: DamageType.Special,
            elementalType: ElementType.Ground,
            effects: [
                {
                    type: EffectType.StatBoost,
                    stat: Stat.Accuracy,
                    amount: -1,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Brave Bird",
            description: "The user tucks in its wings and charges from a low altitude. The user also takes serious damage.",
            pp: 24,
            power: 120,
            accuracy: 100,
            makesContact: true,
            damageType: DamageType.Physical,
            elementalType: ElementType.Flying,
            effects: [
                {
                    type: EffectType.Recoil,
                    recoilType: RecoilDamageType.PercentDamageDealt,
                    amount: 33.33
                }
            ]
        },
        {
            name: "Heat Wave",
            description: "The user attacks by exhaling hot breath on the opposing team. It may also leave targets with a burn.",
            pp: 16,
            power: 95,
            accuracy: 90,
            damageType: DamageType.Special,
            elementalType: ElementType.Fire,
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
            name: "Struggle",
            description: "An attack that is used in desperation only if the user has no PP. It also hurts the user slightly",
            pp: 10,
            power: 50,
            accuracy: 99999,
            damageType: DamageType.Physical,
            makesContact: true,
            elementalType: ElementType.None, //TODO - fix this.
            effects: [
                {
                    type: EffectType.StruggleRecoilDamage
                }
            ]
        },
        {
            name: "Foul Play",
            description: "The user turns the target's power against it. The higher the target's Attack stat, the greater the move's power.",
            pp: 24,
            power: 95,
            accuracy: 100,
            damageEffect: { type: DamageEffectTypes.FoulPlay },
            damageType: DamageType.Physical,
            makesContact: true,
            elementalType: ElementType.Dark,

        },
        {
            name: "Wish",
            description: "One turn after this move is used, the target's HP is restored by half the user's max HP.",
            pp: 16,
            power: 0,
            accuracy: 100,
            damageType: DamageType.Status,
            elementalType: ElementType.Normal,
            effects: [
                {
                    type: EffectType.CreateFieldEffect,
                    effectType: FieldEffectType.Wish,
                    target: TargetType.Self
                }
            ]
        },
        {
            name: "Meteor Mash",
            description: "The target is hit with a hard punch fired like a meteor. It may also raise the user's Attack.",
            pp: 16,
            power: 90,
            accuracy: 90,
            damageType: DamageType.Physical,
            elementalType: ElementType.Steel,
            makesContact: true,
            effects: [
                {
                    type: EffectType.StatBoost,
                    stat: Stat.Attack,
                    amount: 1,
                    chance: 20,
                    target: TargetType.Self
                }
            ]
        },
        {
            name: "Seed Bomb",
            description: "The user slams a barrage of hard-shelled seeds down on the foe from above.",
            pp: 24,
            power: 80,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Grass,
        },
        {
            name: "Acrobatics",
            description: "The user nimbly strikes the target. If the user is not holding an item, this attack inflicts massive damage.",
            pp: 24,
            power: 55,
            accuracy: 100,
            makesContact: true,
            damageType: DamageType.Physical,
            elementalType: ElementType.Flying,
            damageEffect: { type: DamageEffectTypes.Acrobatics }

        },
        {
            name: "Knock Off",
            description: "The user slaps down the target's held item, preventing that item from being used in the battle.",
            pp: 32,
            accuracy: 100,
            makesContact: true,
            damageType: DamageType.Physical,
            elementalType: ElementType.Dark,
            power: 65,
            effects: [{
                type: EffectType.RemoveHeldItem,
                target: TargetType.Enemy
            }]
        },
        {
            name: "Encore",
            description: "The user compels the target to keep using only the move it last used for three turns.",
            pp: 8,
            elementalType: ElementType.Normal,
            damageType: DamageType.Status,
            power: 0,
            effects: [
                {
                    type: EffectType.InflictVolatileStatus,
                    status: VolatileStatusType.Encored,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Pursuit",
            description: "An attack move that inflicts double damage if used on a target that is switching out of battle.",
            pp: 32,
            power: 40,
            makesContact: true,
            elementalType: ElementType.Dark,
            damageType: DamageType.Physical,
            damageEffect: { type: DamageEffectTypes.Pursuit }
        },
        {
            name: "Superpower",
            description: "The user attacks the target with great power. However, it also lowers the user's Attack and Defense.",
            pp: 8,
            power: 120,
            accuracy: 100,
            makesContact: true,
            elementalType: ElementType.Fighting,
            damageType: DamageType.Physical,
            effects: [
                {
                    type: EffectType.StatBoost,
                    chance: 100,
                    stat: Stat.Attack,
                    target: TargetType.Self,
                    amount: -1
                },
                {
                    type: EffectType.StatBoost,
                    chance: 100,
                    stat: Stat.Defense,
                    target: TargetType.Self,
                    amount: -1
                }
            ]
        },
        {
            name: "Bullet Punch",
            description: "The user strikes with a tough punch as fast as a bullet. This move always goes first.",
            pp: 48,
            power: 40,
            accuracy: 100,
            priority: 1,
            makesContact: true,
            elementalType: ElementType.Steel,
            damageType: DamageType.Physical,
        },
        {
            name: "U-Turn",
            description: "After making its attack, the user rushes back to switch places with a party Pokémon in waiting.",
            pp: 32,
            power: 70,
            accuracy: 100,
            makesContact: true,
            damageType: DamageType.Physical,
            elementalType: ElementType.Bug,
            effects: [
                {
                    type: EffectType.SwitchPokemon,
                    chance: 100
                }
            ]
        },
        {
            name: "Pain Split",
            description: "The user adds its HP to the foe's HP, then equally shares the combined HP with the foe.",
            pp: 32,
            power: 0,
            accuracy: 100,
            damageType: DamageType.Status,
            elementalType: ElementType.Normal,
            effects: [
                {
                    type: EffectType.PainSplit,
                }
            ]
        },
        {
            name: "Flamethrower",
            description: "The foe is scorched with an intense blast of fire. The target may also be left with a burn.",
            pp: 24,
            power: 90,
            accuracy: 100,
            damageType: DamageType.Special,
            elementalType: ElementType.Fire,
            makesContact: false,
            effects: [
                {
                    type: EffectType.InflictStatus,
                    status: Status.Burned,
                    chance: 10,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Close Combat",
            description: "The user fights the target up close without guarding itself. It also cuts the user's Defense and Sp. Def.",
            pp: 8,
            power: 120,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Fighting,
            makesContact: true,
            effects: [
                {
                    type: EffectType.StatBoost,
                    stat: Stat.Defense,
                    amount: -1,
                    target: TargetType.Self
                },
                {
                    type: EffectType.StatBoost,
                    stat: Stat.SpecialDefense,
                    amount: -1,
                    target: TargetType.Self
                }
            ]
        },
        {
            name: "Wild Charge",
            description: "The user shrouds itself in electricity and smashes into its target. It also damages the user a little.",
            pp: 24,
            power: 90,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Electric,
            makesContact: true,
            beforeExecuteEffect: {
                type: EffectType.StatusRestore,
                forStatus: Status.Frozen
            },
            effects: [
                {
                    type: EffectType.Recoil,
                    recoilType: RecoilDamageType.PercentDamageDealt,
                    amount: 25,
                },
            ]
        },
        {
            name: "Bounce",
            description: "The user bounces up high, then drops on the target on the second turn. It may also leave the target with paralysis.",
            pp: 8,
            power: 85,
            accuracy: 100,
            makesContact: true,
            twoTurnMove: true,
            firstTurnStatus: VolatileStatusType.Bouncing,
            damageType: DamageType.Physical,
            elementalType: ElementType.Flying,
            effects: [
                {
                    type: EffectType.InflictStatus,
                    chance: 30,
                    status: Status.Paralyzed,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Extreme Speed",
            description: "The user charges the target at blinding speed. This attack always goes before any other move.",
            pp: 8,
            power: 80,
            accuracy: 100,
            damageType: DamageType.Physical,
            makesContact: true,
            elementalType: ElementType.Normal,
            priority: 2
        },
        {
            name: "Signal Beam",
            description: "The user attacks with a sinister beam of light. This may also confuse the target.",
            pp: 16,
            elementalType: ElementType.Bug,
            damageType: DamageType.Special,
            power: 75,
            effects: [{
                type: EffectType.InflictVolatileStatus,
                chance: 10,
                status: VolatileStatusType.Confusion,
                target: TargetType.Enemy
            }
            ]
        },
        {
            name: "Moonlight",
            description: "Restores the user's HP. The amount of HP regained varies with the weather.",
            pp: 16,
            elementalType: ElementType.Fairy,
            damageType: DamageType.Status,
            power: 0,
            effects: [
                {
                    type: EffectType.HealthRestore,
                    amount: 50,
                    target: TargetType.Self,
                    restoreType: HealthRestoreType.PercentMaxHealth
                }
            ]
        },
        {
            name: "Sludge Bomb",
            description: "Unsanitary sludge is hurled at the target. It may also poison the target.",
            pp: 16,
            elementalType: ElementType.Poison,
            damageType: DamageType.Special,
            power: 90,
            effects: [
                {
                    type: EffectType.InflictStatus,
                    status: Status.Poison,
                    chance: 30,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Outrage",
            description: "The user rampages and attacks for two to three turns. The user then becomes confused.",
            pp: 16,
            power: 120,
            elementalType: ElementType.Dragon,
            makesContact: true,
            damageType: DamageType.Physical,
            effects: [
                {
                    type: EffectType.InflictVolatileStatus,
                    status: VolatileStatusType.Outraged,
                    target: TargetType.Self,
                    chance: 100
                }
            ]
        },
        {
            name: "Haze",
            description: "The user creates a haze that eliminates every stat change among all the Pokémon engaged in battle.",
            pp: 48,
            power: 0,
            elementalType: ElementType.Ice,
            damageType: DamageType.Status,
            effects: [
                {
                    type: EffectType.RemoveStatBoosts
                }
            ]
        },
        {
            name: "Recover",
            description: "A self-healing move. The user restores its own HP by up to half of its max HP.",
            pp: 16,
            power: 0,
            elementalType: ElementType.Normal,
            damageType: DamageType.Status,
            effects: [
                {
                    type: EffectType.HealthRestore,
                    target: TargetType.Self,
                    restoreType: HealthRestoreType.PercentMaxHealth,
                    amount: 50
                }
            ]
        },
        {
            name: "Fire Punch",
            description: "The target is punched with a fiery fist. This may also leave the target with a burn.",
            pp: 24,
            power: 75,
            accuracy: 100,
            elementalType: ElementType.Fire,
            damageType: DamageType.Physical,
            makesContact: true,
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
            name: "Dragon Claw",
            description: "The user slashes the target with huge sharp claws.",
            pp: 24,
            power: 80,
            accuracy: 100,
            elementalType: ElementType.Dragon,
            damageType: DamageType.Physical,
            makesContact: true
        },
        {
            name: "Scald",
            description: "The user shoots boiling hot water at its target. This may also leave the target with a burn.",
            pp: 24,
            power: 80,
            accuracy: 100,
            elementalType: ElementType.Water,
            damageType: DamageType.Special,
            beforeExecuteEffect: {
                type: EffectType.StatusRestore,
                forStatus: Status.Frozen
            },
            effects: [
                {
                    type: EffectType.InflictStatus,
                    status: Status.Burned,
                    chance: 30,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Flare Blitz",
            description: "The user cloaks itself in fire and charges the target. This also damages the user quite a lot. This attack may leave the target with a burn",
            pp: 24,
            power: 120,
            accuracy: 100,
            damageType: DamageType.Physical,
            elementalType: ElementType.Fire,
            makesContact: true,
            beforeExecuteEffect: {
                type: EffectType.StatusRestore,
                forStatus: Status.Frozen
            },
            effects: [
                {
                    type: EffectType.Recoil,
                    recoilType: RecoilDamageType.PercentDamageDealt,
                    amount: 33.33,
                },
                {
                    type: EffectType.InflictStatus,
                    status: Status.Burned,
                    chance: 10,
                    target: TargetType.Enemy
                }
            ]
        },
        {
            name: "Low Kick",
            description: "A powerful low kick that makes the target fall over. It inflicts greater damage on heavier targets.",
            pp: 24,
            power: 0,
            accuracy: 100,
            makesContact: true,
            damageType: DamageType.Physical,
            elementalType: ElementType.Fighting,
            damageEffect: { type: DamageEffectTypes.LowKick }
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
            description: "After making its attack, the user rushes back to switch places with a party Pokémon in waiting.",
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
            description: 'The target is struck with an icy-cold beam of energy. It may also freeze the target solid.',
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
            description: 'The user attacks everything around it by swamping its surroundings with a giant wave.',
            pp: 16,
            power: 90,
            damageType: DamageType.Special,
            elementalType: ElementType.Water,
            accuracy: 100,
        },
        {
            name: "Rest",
            description: "The user goes to sleep for two turns. This fully restores the user's HP and heals any status conditions.",
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
            description: 'A move that leaves the target badly poisoned. Its poison damage worsens every turn.',
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
            description: 'The user violently whirls its vines, tentacles, or the like to harshly lash the target.',
            pp: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Grass,
            power: 120,
            accuracy: 85,
            makesContact: true
        },
        {
            name: "Earthquake",
            description: 'The user sets off an earthquake that strikes those around it.',
            pp: 16,
            damageType: DamageType.Physical,
            elementalType: ElementType.Ground,
            power: 100,
            accuracy: 100,
        },
        {
            name: "Roost",
            description: "The user lands and rests its body. It restores the user's HP by up to half of its max HP.",
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
            description: "The user heightens its mental focus and unleashes its power. This may also lower the target's Sp. Def stat.",
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
            description: 'The user attacks with a blade of air that slices even the sky. This may also make the target flinch.',
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
            name: "Will-O-Wisp",
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
            name: "Swords Dance",
            description: "A frenetic dance to uplift the fighting spirit. This sharply raises the user's Attack stat.",
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
            name: "Poison Powder",
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
            name: "Thunder Wave",
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
            description: 'The target is attacked with an intense blast of all-consuming fire. It may also leave the target with a burn.',
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

            name: 'Hydro Pump',
            pp: 10,
            description: 'The foe is blasted by a huge volume of water launched under great pressure.',
            power: 120,
            accuracy: 85,
            elementalType: ElementType.Water,
            damageType: DamageType.Special,

        },
        {
            name: "Thunderbolt",
            description: 'A strong electric blast crashes down on the target. This may also leave the target with paralysis.',
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

