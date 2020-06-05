import React from 'react';
import {act,ShallowRenderer} from 'react-dom/test-utils';
import { render, unmountComponentAtNode } from 'react-dom';


import Message from './Message';

describe('message tests', () => {

    /*
    testing rules for the message component:

    1- if we have a write time of 0, then the message should show instantly.
    2- otherwise the message should be completely shown at approximatley the value we put into 'writeTimeInMilliseconds'
    3 -the size of the message should have no bearing on how long it takes to write.
    */
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

    jest.useFakeTimers();

    it('shows message instantly if write time is 0', () => {
        act(() => { render(<Message message={"Testing Message"} writeTimeMilliseconds={0} />, container) });
        expect(container?.getElementsByClassName('message').length).toBe(1);
        expect(container?.getElementsByClassName('message')[0].innerHTML).toBe('Testing Message');
    });

    it('shows full message at correct milliseconds', () => {
        act(() => { render(<Message message={"Testing Message"} writeTimeMilliseconds={1000} />, container) });
        act(() => { jest.advanceTimersByTime(1000) });
        expect(container?.getElementsByClassName('message').length).toBe(1);
        expect(container?.getElementsByClassName('message')[0].innerHTML).toBe('Testing Message');
    });

    it(' has a longer message but does not take longer time', () => {
        act(() => { render(<Message message={"Testing Message that is much longer than the previous message"} writeTimeMilliseconds={1000} />, container) });
        act(() => { jest.advanceTimersByTime(1000) });
        expect(container?.getElementsByClassName('message').length).toBe(1);
        expect(container?.getElementsByClassName('message')[0].innerHTML).toBe('Testing Message that is much longer than the previous message');
    });

    it('correctly calls onFinish after it has completed', ()=>{
        let finishTest = false;
        const onFinish = ()=>{
            finishTest = true;
        }        
        act(() => { render(<Message message={"Testing Message that is much longer than the previous message"} writeTimeMilliseconds={1000} onFinish={onFinish} />, container) });
        //should be write time + delay time + a little buffer;
        act(() => { jest.advanceTimersByTime(2050) });
        expect(finishTest).toBe(true);        
    });





});
