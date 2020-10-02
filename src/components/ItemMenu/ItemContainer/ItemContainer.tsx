import React from 'react';
import './ItemContainer.css'
import CSS from 'csstype';
import { Item } from '../../../game/interfaces';

interface Props {
    item:Item
}

const HealthBar: React.FunctionComponent<Props> = (props) => {
    return (
        <div className='item-container'>
            {props.item.name} x{props.item.quantity}
        </div>
    );
}

export default HealthBar;