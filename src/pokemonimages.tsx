// images.js
interface PokemonImageData {
    name:string,
    frontImageSrc:string,
    backImageSrc:string,
    smallImageSrc:string
};

//we should be able to get this from some database or something somewhere?
const names = [
    'venusaur',
    'charizard',
    'blastoise',
    'alakazam',
    'raichu',
    'gengar'
]

const images = names.map((el)=>{
    return {
        frontImageSrc:'./images/pokemon/front/' + el+ '.png',
        backImageSrc:'./images/pokemon/back/' + el + '.png',
        smallImageSrc:'./images/pokemon/small/' + el + '.png',
        name:el
    }
});


export default images