import React, { useState } from 'react';
import { Item } from 'game/interfaces';
import './ItemMenu.css'
import ItemMenuTabs, { ItemTabName } from './ItemMenuTabs/ItemMenuTabs';
import ItemContainer from "./ItemContainer/ItemContainer"


interface Props {
    items: Array<Item>,
    onItemClick: (item: Item) => void
    onCancelClick?: () => void
}

const ItemMenu: React.FunctionComponent<Props> = (props) => {

    const [menuState, setMenuState] = useState(ItemTabName.HPandPP);

    /*
    const items = props.items.map((el, index) => {
        return (
            <tr onClick={(evt) => props.onItemClick(el)} key={el.id} className='item-row'>
                <td className='item-name'>
                    {el.name}
                </td>
                <td className='item-description'>
                    {el.description}
                </td>
                <td className='item-quantity'>
                    {el.quantity}
                </td>
            </tr>
        )
    });
    */


    const items = props.items.map((el, index) =>
        <ItemContainer onClick={(item)=>props.onItemClick(item)}  key={el.id} item={el} />
    );

    return (
        <div className='item-menu'>
            <div className='item-menu-top'>
                <div className='cancel-button' onClick={() => { if (props.onCancelClick) { props.onCancelClick() } }} style={{ width: "80%" }}>Cancel </div>
                <ItemMenuTabs onTabClick={(type) => { setMenuState(type) }} selectedTab={menuState} />
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