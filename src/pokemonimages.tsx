// images.js
interface PokemonImageData {
    id:number,
    name:string,
    frontImageSrc:string,
    backImageSrc:string,
    smallImageSrc:string
};

//we should be able to get this from some database or something somewhere?
const idsAndNames = [
    {id:3,name:'venusaur'},
    {id:6,name:'charizard'},
    {id:9, name:'blastoise'}
]

const images = idsAndNames.map((el)=>{
    return {
        frontImageSrc:'./images/pokemon/front/' + el.id + '.png',
        backImageSrc:'./images/pokemon/back/' + el.id + '.png',
        smallImageSrc:'./images/pokemon/small/' + el.id + '.gif',
        ...el
    }
});


export default images