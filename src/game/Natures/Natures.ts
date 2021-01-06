import { Stat } from "game/Stat";

export enum NatureType {
    Adamant='adamant',
    Bashful='bashful',
    Bold='bold',
    Brave='brave',
    Calm='calm',
    Careful='careful',
    Docile='docile',
    Gentle='gentle',
    Hardy='hardy',
    Hasty='hasty',
    Impish='impish',
    Jolly='jolly',
    Lax='lax',
    Lonely='lonely',
    Mild='mild',
    Modest='modest',
    Naive='naive',
    Naughty='naughty',
    Quiet='quiet',
    Quirky='quirky',
    Rash='rash',
    Relaxed='relaxed',
    Sassy='sassy',
    Serious='serious',
    Timid='timid',
}


interface NatureInfo {
    nature:NatureType,
    increase:Stat,
    decrease:Stat
}

const natures: Array<NatureInfo> = [
    {nature:NatureType.Adamant,increase:Stat.Attack,decrease:Stat.SpecialAttack},
    {nature:NatureType.Bashful,increase:Stat.SpecialAttack,decrease:Stat.SpecialAttack},
    {nature:NatureType.Bold,increase:Stat.Defense,decrease:Stat.Attack},
    {nature:NatureType.Brave,increase:Stat.Attack,decrease:Stat.Speed},
    {nature:NatureType.Calm,increase:Stat.SpecialDefense,decrease:Stat.Attack},
    {nature:NatureType.Careful,increase:Stat.SpecialDefense,decrease:Stat.SpecialAttack},
    {nature:NatureType.Docile,increase:Stat.Defense,decrease:Stat.Defense},
    {nature:NatureType.Gentle,increase:Stat.SpecialDefense,decrease:Stat.Defense},
    {nature:NatureType.Hardy,increase:Stat.Attack,decrease:Stat.Attack},
    {nature:NatureType.Hasty,increase:Stat.Speed,decrease:Stat.Defense},
    {nature:NatureType.Impish,increase:Stat.Defense,decrease:Stat.SpecialAttack},
    {nature:NatureType.Jolly,increase:Stat.Speed,decrease:Stat.SpecialAttack},
    {nature:NatureType.Lax,increase:Stat.Defense,decrease:Stat.SpecialDefense},
    {nature:NatureType.Lonely,increase:Stat.Attack,decrease:Stat.Defense},
    {nature:NatureType.Mild,increase:Stat.SpecialAttack,decrease:Stat.Defense},
    {nature:NatureType.Modest,increase:Stat.SpecialAttack,decrease:Stat.Attack},
    {nature:NatureType.Naive,increase:Stat.Speed,decrease:Stat.SpecialDefense},
    {nature:NatureType.Naughty,increase:Stat.Attack,decrease:Stat.SpecialDefense},
    {nature:NatureType.Quiet,increase:Stat.SpecialAttack,decrease:Stat.Speed},
    {nature:NatureType.Quirky,increase:Stat.SpecialDefense,decrease:Stat.SpecialDefense},
    {nature:NatureType.Rash,increase:Stat.SpecialAttack,decrease:Stat.SpecialDefense},
    {nature:NatureType.Relaxed,increase:Stat.Defense,decrease:Stat.Speed},
    {nature:NatureType.Sassy,increase:Stat.SpecialDefense,decrease:Stat.Speed},
    {nature:NatureType.Serious,increase:Stat.Speed,decrease:Stat.Speed},
    {nature:NatureType.Timid,increase:Stat.Speed,decrease:Stat.Attack}, 
  
];

export function GetNature(natureType:NatureType) : NatureInfo{

    const nature =  natures.find((obj)=>{
        return obj.nature === natureType;
    })

    if (nature === undefined){
        throw new Error(`Could not find nature : ${natureType} in call to GetNature()`);
    }

    return nature;
}