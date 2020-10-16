import React, { useRef, useEffect, useState } from "react";
import { TweenMax } from "gsap";
import './AnimatedHealthBar.css'




interface Props {
    value: Number,
    animate?: Boolean,
    onComplete?: () => void
}

/*
This is a healthbar that animates itself when its prop value changes.
For example if it starts at 100 health and then something updates it to be 50 health, 
it will run an animation of the health going down (i.e. it won't instantly change on the UI).
*/

const AnimatedHealthBar: React.FunctionComponent<Props> = (props) => {

    const [bgColor, setBGColor] = useState<string>("green");
    let healthRef: any = useRef(null);

    //i don't like how this is based on the html element instead of the actual health value.
    //the reason why this is, is teh way this is setup, the actual number value for the prop is immediatley set 
    //and does not actually count down.
    //we would have to change the way this works in order to change this.
    //see the "animated number" component to see how this might work instead.
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
        let healthBar = healthRef;
        if (props.animate === false) {
            setBGColor(getHealthColor(healthBar))
            return;
        }

    }, [props.value,props.animate]);




    useEffect(() => {
        let animTime = 2;

        let healthBar = healthRef;

        //we are going to control animation from the top level controller so this is now fine




        //little hack here, for some reason the healtbar color doesn't change with animtime 0. probably because onUpdate() never gets called.
        //so we are using this work around here until i can come up with cleaner solution.
        if (props.animate === false) {
            animTime = 0;
            TweenMax.to(healthRef, 0.01, {
                width: props.value + '%',
                onUpdate: () => {
                    setBGColor(getHealthColor(healthBar))
                },
                onComplete: () => {
                    if (props.onComplete) {
                        props.onComplete();
                    }
                }
            });

            return;

        }


        TweenMax.to(healthRef, animTime, {
            width: props.value + '%',
            onUpdate: () => {
                setBGColor(getHealthColor(healthBar))
            },
            onComplete: () => {
                if (props.onComplete) {
                    props.onComplete();
                }
            }
        });
    }, [props.value,props]);

    useEffect(() => {
        setBGColor(getHealthColor(healthRef));
    }, []);






    return (
        <div className="healthbar-container">
            <span className="healthbar-hp-prepend"> HP </span>
            <div className="healthbar">
                <div ref={element => { healthRef = element }} style={{ height: '100%', backgroundColor: bgColor }} className="healthbar-fill"> </div>
            </div>
        </div>
    );
}

AnimatedHealthBar.defaultProps = {
    animate: true
}

export default AnimatedHealthBar;