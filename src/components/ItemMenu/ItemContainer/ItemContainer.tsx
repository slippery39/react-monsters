import React from 'react';
import './ItemContainer.css'
import { Item } from 'game/interfaces';

interface Props {
    item:Item
    onClick:(item:Item)=>void
}

const ItemContainer: React.FunctionComponent<Props> = (props) => {
    return (
        <div className='item-container'>
        <div className='item-name' onClick={()=>{if (props.onClick){props.onClick(props.item)}}} >
            {props.item.name} x{props.item.quantity}
        </div>
        <div className='item-description'>{props.item.description}</div>
        </div>
    );
}

export default ItemContainer;