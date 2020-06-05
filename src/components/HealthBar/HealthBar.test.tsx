import React from 'react';
import { render } from '@testing-library/react';
import HealthBar from './HealthBar';

describe('healthbar tests', () => {

    /*
    some rules here,
    
    if the value is <=20{
        we use red for the color
    },
    if its <=50{
        we use yellow for the color
    },
    if its <=100{
        we use green for the color
    }
    */

    it('renders red when health is low', () => {
        const { container } = render(<HealthBar value={20} />);
        expect(container.getElementsByClassName('healthbar-fill')[0]).toHaveStyle('background-color:red');
    })
    it('renders yellow when health is medium', ()=>{
        const { container } = render(<HealthBar value={50} />);
        expect(container.getElementsByClassName('healthbar-fill')[0]).toHaveStyle('background-color:yellow');
    });
    it('renders green when health is high', ()=>{
        const { container } = render(<HealthBar value={100} />);
        expect(container.getElementsByClassName('healthbar-fill')[0]).toHaveStyle('background-color:green');
    });




});
