import {ElementType, Status, Technique} from "./interfaces";



interface PremadeTechniques{
    [key:string] : Technique
}

export function GetTech(name:string){
    
    const techs: PremadeTechniques = {
        "sleep powder":{
            id:-1,
            name:"Sleep Powder",
            description:"The user scatters a big cloud of sleep-inducing dust around the target",
            damageType:'status',
            pp:15,
            currentPP:15,
            power:0,
            elementalType: ElementType.Grass,
            effects:[
                {
                    type:'inflict-status',
                    status:Status.Sleep,
                    target:'enemy',
                    chance:100
                }
            ],
            chance:75
        },
        "will o wisp":{
            id:-1,
            name:"will o wisp",
            description:"The user shoots a sinister, bluish-white flame at the target to inflict a burn",
            damageType:'status',
            pp:15,
            currentPP:15,
            power:0,
            elementalType:ElementType.Fire,
            effects:[
                {

                    type:'inflict-status',
                    status:Status.Burned,
                    target:'enemy',
                    chance:100
                }
            ],
            chance:85
        },
        "poison powder":{
            id:-1,
            name:"poison powder",
            description:"The user scatters a cloud of poisonous dust that poisons the target",
            damageType:'status',
            pp:15,
            currentPP:15,
            power:0,
            elementalType:ElementType.Poison,
            effects:[
                {

                    type:'inflict-status',
                    status:Status.Poison,
                    target:'enemy',
                    chance:100
                }
            ],
            chance:75
        },
        "thunder wave":{     
            id:-1,   
            name:"thunder wave",
            description:"The user launches a weak jolt of electricity that paralyzes the target",
            damageType:'status',
            pp:20,
            power:0,
            currentPP:20,
            elementalType:ElementType.Electric,
            effects:[
                {

                    type:'inflict-status',
                    status:Status.Paralyzed,
                    target:'enemy',
                    chance:100
                }
            ],
            chance:85
        },
        "fireblast":       {
            id: 1,
            name: 'Fire blast',
            description: 'A fiery blast',
            pp: 10,
            currentPP: 10,
            power:120,
            damageType: 'special',
            elementalType:ElementType.Fire,
            chance:85,
            effects:[
                {
                    type:'inflict-status',
                    status:Status.Burned,
                    target:'enemy',
                    chance:15
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
                power:75,
                chance:85,
                damageType:'physical',
                elementalType:ElementType.Flying
            },
            "hydro pump":{
                
                    id: 3,
                    name: 'Hydro Pump',
                    pp: 10,
                    description: 'hydro pumpy action',
                    currentPP: 10,
                    power:120,
                    chance:85,
                    elementalType:ElementType.Water,
                    damageType:'special',               
               
            },
            "razor leaf":{
                
                    id: 5,
                    name: 'Razor Leaf',
                    description: 'some razory leaves',
                    pp: 35,
                    currentPP: 35,
                    power:84,
                    chance:95,
                    damageType:'physical',
                    elementalType:ElementType.Grass,
             
            }
    
    }

    const tech = techs[name.toLowerCase()];

    if (tech === undefined){
        throw new Error(`Could not find technique for name ${name}`)
    }
    return techs[name.toLowerCase()];
}

