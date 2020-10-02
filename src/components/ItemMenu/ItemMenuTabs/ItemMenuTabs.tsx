import React from 'react';
import './ItemMenuTabs.css'


export enum ItemTabName{
    None = 'None',
    HPandPP='HPandPP',
    Status='status',
    Pokeballs = 'pokeballs',
    BattleItems = 'battle-items'
}

interface Props {
   selectedTab:ItemTabName
   onTabClick:(type:ItemTabName)=>void
}

const ItemMenuTabs: React.FunctionComponent<Props> = (props) => { 
    const defaultClass = 'tab-button'

    var hpClass = defaultClass+ ' tab-hp-restore';
    if (props.selectedTab === ItemTabName.HPandPP){
        hpClass+= ' selected'
    }
    
    var statusRestoreClass = defaultClass+ ' tab-status-restore';
    if (props.selectedTab === ItemTabName.Status){
        statusRestoreClass+= ' selected'
    }

    var pokeballsClass = defaultClass+ ' tab-pokeballs';
    if (props.selectedTab === ItemTabName.Pokeballs){
        pokeballsClass+= ' selected'
    }

    var battleItemsClass = defaultClass+ ' tab-battle-items';
    if (props.selectedTab === ItemTabName.BattleItems){
        battleItemsClass+= ' selected'
    }

    return (
        <div className='tabs-container'>
        <div onClick={()=>props.onTabClick(ItemTabName.HPandPP)} className={hpClass}>HP/PP Restore</div>
        <div onClick={()=>props.onTabClick(ItemTabName.Status)}  className={statusRestoreClass}>Status Restore</div>
        <div onClick={()=>props.onTabClick(ItemTabName.Pokeballs)} className={pokeballsClass}>Pokeballs</div>
        <div onClick={()=>props.onTabClick(ItemTabName.BattleItems)}  className={battleItemsClass}>Battle Items</div>
    </div>
    );
}

export default ItemMenuTabs