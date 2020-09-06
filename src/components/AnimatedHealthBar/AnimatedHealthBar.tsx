import React, { useRef, useEffect, useState } from "react";
import { TweenMax } from "gsap";
import './AnimatedHealthBar.css'

interface Props {
    value: Number,
    animate?:Boolean,
    onComplete?: ()=>void
}

/*
This is a healthbar that animates itself when its prop value changes.
For example if it starts at 100 health and then something updates it to be 50 health, 
it will run an animation of the health going down (i.e. it won't instantly change on the UI).
*/

const AnimatedHealthBar: React.FunctionComponent<Props> = (props) => {
    //not sure if i need this at the moment, our tween works just fine
    const [healthAnimation, setHealthAnimation] = useState<TweenMax>();
    const [bgColor, setBGColor] = useState<string>("green");
    let healthRef: any = useRef(null);

    function getHealthColor(element: any) {
        if (element.current) {
            return 'pink';
        }
        const value = parseInt(getComputedStyle(element).width.split("%")[0]);

        if (value <= 20) {
            return 'red';
        }
        else if (value <= 50) {
            return 'orange';
        }
        else {
            return 'green';
        }
    }

    
    useEffect(() => {

        console.log('animation effect has started');
        let animTime = 2;
        if (props.animate === false){
            animTime = 0;

        }
        let healthBar = healthRef;
        setHealthAnimation(TweenMax.to(healthRef, animTime, {
            width: props.value + '%',
             onUpdate: () => {
                setBGColor(getHealthColor(healthBar))
            },
            onComplete:()=>{
                if (props.onComplete){
                    console.log('has the health animation completed?')
                    props.onComplete();
                    console.log('health animation on complete has fired');
                }
            }
        }));
    }, [props.value]);
    


    useEffect(() => {
        setBGColor(getHealthColor(healthRef));
    }, []);


    return (
        <div className="healthbar" style={{ width: '100px', height: '10px', display: 'inline-block', border: '1px solid black',boxSizing: 'border-box' }}>
            <div ref={element => { healthRef = element }} style={{ height: '100%', backgroundColor: bgColor }} className="healthbar-fill"> </div>
        </div>        
    );
}

AnimatedHealthBar.defaultProps = {
    animate:true
}

export default AnimatedHealthBar;