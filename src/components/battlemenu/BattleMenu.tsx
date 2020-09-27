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
            <div className='battle-menu-button battle-menu-attack' onClick={props.onMenuAttackClick}>Fight</div>
            <div className="battle-menu-bottom-row">
            <div className='battle-menu-button battle-menu-item battle-menu-button-small' onClick={props.onMenuItemClick} > Bag</div>
            <div className='battle-menu-button battle-menu-switch battle-menu-button-small' onClick={props.onMenuSwitchClick}>Pokemon</div>
            </div>
        </div>
    );
}

export default BattleMenu;