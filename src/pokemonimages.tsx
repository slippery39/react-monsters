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
    'raichu'
]

const images = names.map((el)=>{
    return {
        frontImageSrc:'./images/pokemon/front/' + el+ '.png',
        backImageSrc:'./images/pokemon/back/' + el + '.png',
        smallImageSrc:'./images/pokemon/small/' + el + '.gif',
        name:el
    }
});


export default images