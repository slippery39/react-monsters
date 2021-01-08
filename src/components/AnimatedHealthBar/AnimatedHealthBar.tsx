import React, { useRef, useEffect, useState, useCallback } from "react";
import { TweenMax } from "gsap";
import './AnimatedHealthBar.css'




interface Props {
    value: number,
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
    // eslint-disable-next-line
    const [forceUpdate, setForceUpdate] = useState<boolean>(false); //used to force an update to the component to get the ref value updated in the UI. 
    const savedValue = useRef<{ value: number }>({ value: 100 });

    useEffect(() => {
        savedValue.current = { value: props.value };
    });

    const currentValue = savedValue.current.value;

    const TestGetHealthColor = useCallback(() => {

        if (currentValue === undefined) {
            return 'pink'
        }
        if (currentValue <= 20) {
            return 'red';
        }
        else if (currentValue <= 50) {
            return 'orange';
        }
        else {
            return 'green';
        }
    }, [currentValue]);


    useEffect(() => {
        if (props.animate === false) {
            setBGColor(TestGetHealthColor())
            return;
        }
    }, [props.value, props.animate, TestGetHealthColor]);

    useEffect(() => {
        let animTime = 2;

        if (props.animate === false) {
            savedValue.current.value = props.value;
            setBGColor(TestGetHealthColor());
            setForceUpdate(true);
            return;
        }

        TweenMax.to(savedValue.current, animTime, {
            value: props.value,
            onUpdate: () => {
                setBGColor(TestGetHealthColor())
            },
            onComplete: () => {
                if (props.onComplete) {
                    props.onComplete();
                }
            }
        });
    }, [props.value, props, TestGetHealthColor]);

    useEffect(() => {
        setBGColor(TestGetHealthColor());
    }, [TestGetHealthColor]);

    return (
        <div className="healthbar-container">
            <span className="healthbar-hp-prepend"> HP </span>
            <div className="healthbar">
                <div style={{ height: '100%', width: savedValue.current.value + "%", backgroundColor: bgColor }} className="healthbar-fill"> </div>
            </div>
        </div>
    );
}

AnimatedHealthBar.defaultProps = {
    animate: true
}

export default AnimatedHealthBar;