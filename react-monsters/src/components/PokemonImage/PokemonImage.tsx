import React from 'react';
import "./PokemonImage.css";

interface Props {
    name: string,
    type: 'back' | 'front' | 'small'
}

function getImages(name: string) {

    return {

        frontImageSrc: './images/pokemon/front/' + name + '.png',
        backImageSrc: './images/pokemon/back/' + name + '.png',
        smallImageSrc: './images/pokemon/small/' + name + '.png',
    }
}

const PokemonImage: React.FunctionComponent<Props> = (props) => {

    let imageData = getImages(props.name.toLowerCase());

    let imageToUse;

    switch (props.type) {
        case 'back': {
            imageToUse = imageData?.backImageSrc;
            break;
        }
        case 'front': {
            imageToUse = imageData?.frontImageSrc;
            break;
        }
        case 'small': {
            imageToUse = imageData?.smallImageSrc;
        }
    }

    return (
        <img className="pokemon-sprite" src={imageToUse} alt={props.name} />
    );
}

export default PokemonImage;