import React from 'react';
import './BattleMenu.css'

interface Props {
    onMenuAttackClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    onMenuItemClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    onMenuSwitchClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const BattleMenu: React.FunctionComponent<Props> = (props) => {

    return (
        <div className='battle-menu'>
            <div className='battle-menu-button battle-menu-attack' onClick={props.onMenuAttackClick}>Attack</div>
            <div className='battle-menu-button battle-menu-item' onClick={props.onMenuItemClick} >Item</div>
            <div className='battle-menu-button battle-menu-switch' onClick={props.onMenuSwitchClick}>Switch</div>
        </div>
    );
}

export default BattleMenu;