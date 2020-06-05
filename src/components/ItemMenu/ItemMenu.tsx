import React from 'react';
import './ItemMenu.css'


interface Item {
    id: number,
    name: String,
    description: String,
    quantity: number
}

interface Props {
    items: Array<Item>,
    onItemClick: (item: Item) => void
}

const ItemMenu: React.FunctionComponent<Props> = (props) => {

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

    return (
        <table className='item-menu'>
            <thead>
                <tr>
                    <th> Name </th>
                    <th> Description </th>
                    <th> Quantity </th>
                </tr>
            </thead>
            <tbody>
                {items}
            </tbody>
        </table>
    );
}

export default ItemMenu;