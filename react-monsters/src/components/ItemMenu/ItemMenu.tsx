import React from 'react';
import './ItemMenu.css'
import ItemContainer from "./ItemContainer/ItemContainer"
import { Item } from 'game/Items/Item';


interface Props {
    items: Array<Item>,
    onItemClick: (item: Item) => void
    onCancelClick?: () => void
}

const ItemMenu: React.FunctionComponent<Props> = (props) => {

    const items = props.items.map((el, index) =>
        <ItemContainer onClick={(item) => props.onItemClick(item)} key={el.id} item={el} />
    );

    return (
        <div className='item-menu'>
            <div className='item-menu-top'>
                <div className='cancel-button' onClick={() => { if (props.onCancelClick) { props.onCancelClick() } }} style={{ width: "80%" }}>Cancel </div>
            </div>
            <div className='item-menu-bottom'>
                <div className='item-menu-items'>
                    {items}
                </div>
            </div>

        </div>
    );
}

export default ItemMenu;