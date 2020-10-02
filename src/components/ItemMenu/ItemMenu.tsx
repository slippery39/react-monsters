import React, { useState } from 'react';
import { Item } from '../../game/interfaces';
import './ItemMenu.css'
import ItemMenuTabs, {ItemTabName} from './ItemMenuTabs/ItemMenuTabs';
import ItemContainer from "./ItemContainer/ItemContainer"


interface Props {
    items: Array<Item>,
    onItemClick: (item: Item) => void
}

const ItemMenu: React.FunctionComponent<Props> = (props) => {

    const [menuState,setMenuState] = useState(ItemTabName.HPandPP);


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

    const fakeItems:Array<Item> = [
        {
            id:1,
            name:'Potion',
            description:'A potion',
            quantity:5
        },
        {
            id:2,
            name:'Antidote',
            description:'An antidote for poison',
            quantity:99
        },
        {
            id:3,
            name:'Paralyze Heal',
            description:'A healing solution for paralysis',
            quantity:33
        }
    ]

    const items = fakeItems.map((el,index)=>
        <ItemContainer item={el} />
    );

    return (
        <div className='item-menu'>
            <div className='item-menu-left'>
                <div className='pokemon-party'>

                </div>
                <div className='cancel-button'></div>
            </div>
            <div className='item-menu-right'>
                <ItemMenuTabs onTabClick={(type)=>{setMenuState(type)}} selectedTab={menuState} />
                <div className='item-menu-items'>
                    {items}
                </div>
            </div>
            
        </div>
    );
}

export default ItemMenu;