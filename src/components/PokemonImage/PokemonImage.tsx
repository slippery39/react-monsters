import React from 'react';
import images from "../../pokemonimages";

interface Props {
    name:string,
    type: 'back' | 'front' | 'small'
}

const PokemonImage: React.FunctionComponent<Props> = (props) => {

    //search for the image
    const imageData = images.find((el =>{
       return el.name.toLowerCase() === props.name.toLowerCase()
    }));

    let imageToUse;
    switch(props.type){
        case 'back':{
            imageToUse = imageData?.backImageSrc;
            break;
        }
        case 'front':{
            imageToUse = imageData?.frontImageSrc;
            break;
        }
        case 'small':{
            imageToUse = imageData?.smallImageSrc;
        }
    }    

    return (
        <img src={imageToUse} alt="pokemon" />
    );
}

export default PokemonImage;