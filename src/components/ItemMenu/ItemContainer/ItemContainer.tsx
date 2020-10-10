import React from 'react';
import './ItemContainer.css'
import { Item } from '../../../game/interfaces';

interface Props {
    item:Item
    onClick:(item:Item)=>void
}

const ItemContainer: React.FunctionComponent<Props> = (props) => {
    return (
        <div onClick={()=>{if (props.onClick){props.onClick(props.item)}}} className='item-container'>
            {props.item.name} x{props.item.quantity}
        </div>
    );
}

export default ItemContainer;