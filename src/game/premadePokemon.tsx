import {Pokemon,ElementType, TechniqueEffectType} from './interfaces';

export function createCharizard(id: number) : Pokemon {
    const charizard: Pokemon = {
        id: id,
        name: 'Charizard',
        elementalTypes:[ElementType.Fire,ElementType.Flying],
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
                currentPP: 10,
                power:120,
                damageType:'special',
                elementalType:ElementType.Fire,
                chance:85,
                secondaryEffects:[
                    {
                    effectType:TechniqueEffectType.Burn,
                    chance:15,
                    }
                ]
            },
            {
                id: 2,
                name: 'Fly',
                description: 'a flying attack',
                pp: 15,
                currentPP: 15,
                power:75,
                chance:85,
                damageType:'physical',
                elementalType:ElementType.Flying
            }
        ]
    }

    return charizard;
}

export function createBlastoise(id: number) {
    const blastoise: Pokemon = {
        id: id,
        name: 'Blastoise',
        elementalTypes:[ElementType.Water],
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
                currentPP: 10,
                power:120,
                chance:85,
                elementalType:ElementType.Water,
                damageType:'special'
                
            }
        ]
    }
    return blastoise;
}

export function createVenusaur(id: number) {
    const venusaur: Pokemon = {
        id: id,
        name: 'Venusaur',
        elementalTypes:[ElementType.Grass,ElementType.Poison],
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
            currentPP: 35,
            power:55,
            chance:95,
            damageType:'physical',
            elementalType:ElementType.Grass
        }]

    }
    return venusaur;
}