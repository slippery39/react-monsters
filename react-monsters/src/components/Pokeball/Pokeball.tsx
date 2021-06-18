import React from 'react';
import './Pokeball.css';


interface Props {
    isFainted?: boolean
}

const Pokeball: React.FunctionComponent<Props> = (props) => {

    let className = 'pokeball-img';

    if (props.isFainted) {
        className += ' pokeball-fainted'
    }
    return (
        <img className={className} alt={"pokeball"} width="100%" src="/images/misc/pokeball.png" />
    );
}

export default Pokeball;