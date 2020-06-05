import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, unmountComponentAtNode } from 'react-dom';

import BattleHealthDisplay from './BattleHealthDisplay';
import { Pokemon } from '../../interfaces/pokemon';


describe('battle health display tests', () => {

    let container: HTMLElement | null;
    beforeEach(() => {
        // setup a DOM element as a render target
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        // cleanup on exiting
        container ? unmountComponentAtNode(container) : "";
        container?.remove();
        container = null;
    });

    /*
        tests,
        displays healthbar with correct value based on pokemon health,
        displays the correct health text
        displays the name correctly
    */

    const testPokemon: Pokemon = {
        id: 6,
        name: 'Charizard',
        originalStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        currentStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        techniques:[]
    }

    it('displays healthbar correctly at 100% health', () => {
        act(() => { render(<BattleHealthDisplay pokemon={testPokemon} />, container) });

        //need to search first for the item to satisfy typescripts null checking.
        const healthbarExists = container?.getElementsByClassName('healthbar-fill')[0];
        const healthbar = healthbarExists ? healthbarExists : document.createElement("div");
        const style = window.getComputedStyle(healthbar);

        expect(style.width).toBe('100%');

    });

    it('displays healthbar correctly at 50% health', () => {
        testPokemon.currentStats.health = 150;
        act(() => { render(<BattleHealthDisplay pokemon={testPokemon} />, container) });

        //need to search first for the item to satisfy typescripts null checking.
        const healthbarExists = container?.getElementsByClassName('healthbar-fill')[0];
        const healthbar = healthbarExists ? healthbarExists : document.createElement("div");
        const style = window.getComputedStyle(healthbar);

        expect(style.width).toBe('50%');
    });

    it('displays healthbar correctly at 0% health', () => {
        testPokemon.currentStats.health = 0;
        act(() => { render(<BattleHealthDisplay pokemon={testPokemon} />, container) });

        //need to search first for the item to satisfy typescripts null checking.
        const healthbarExists = container?.getElementsByClassName('healthbar-fill')[0];
        const healthbar = healthbarExists ? healthbarExists : document.createElement("div");
        const style = window.getComputedStyle(healthbar);
        expect(style.width).toBe('0%');
    });

    it ('displays health text correctly', ()=>{
        testPokemon.currentStats.health = 80;
        act(() => { render(<BattleHealthDisplay pokemon={testPokemon} />, container) });
        const healthTextExists = container?.getElementsByClassName('battle-health-text')[0];
        const healthText = healthTextExists ? healthTextExists : document.createElement("div");
        expect(healthText.innerHTML).toBe('80 / 300')
    });

    it('displays name correctly',()=>{
        act(() => { render(<BattleHealthDisplay pokemon={testPokemon} />, container) });
        const nameExists = container?.getElementsByClassName('battle-health-name')[0];
        const name = nameExists ? nameExists : document.createElement("div");
        expect(name.innerHTML).toBe('Charizard')
    });
});
