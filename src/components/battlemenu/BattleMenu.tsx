import React from 'react';
import './BattleMenu.css'

interface Props {
    onMenuAttackClick: ()=>void;
    onMenuItemClick?: ()=>void;
    onMenuSwitchClick:()=>void;
    onMenuPokemonInfoClick: ()=>void;
}

const BattleMenu: React.FunctionComponent<Props> = (props) => {

    return (
        <div className='battle-menu'>
            <div className='battle-menu-button battle-menu-attack' onClick={props.onMenuAttackClick}>Fight</div>
            <div className="battle-menu-bottom-row">
            <div className="battle-menu-button battle-menu-button-small battle-menu-info" onClick={props.onMenuPokemonInfoClick}>Pokemon Info </div>
            <div className='battle-menu-button battle-menu-switch battle-menu-button-small' onClick={props.onMenuSwitchClick}>Switch</div>
            </div>
        </div>
    );
}

export default BattleMenu;