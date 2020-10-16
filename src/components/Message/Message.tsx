import React, { useState, useEffect } from 'react';
import './Message.css';


interface Props {
    message?: String,
    writeTimeMilliseconds?: number,
    finishDelayTime?: number,
    animated?:Boolean,
    onFinish?(): any,
    messageRef?:(el:any)=>void
}

//this default parameters thing is annoying
const Message: React.FC<Props> = ({ message = '', animated= true, writeTimeMilliseconds = 1000, finishDelayTime = 1000, onFinish = () => { },messageRef=(el)=>{} }: Props,) => {

    //instantly show the message if the writeTime is set to 0
    const [currentTextIndex, setCurrentTextIndex] = useState(writeTimeMilliseconds === 0 || animated === false ? message.length : 0);

    const [hasFinished, setHasFinished] = useState(false);
    /*eslint-disable*/
    useEffect(function () {

        if (animated === false){
            return;
        }

        const interval = setInterval(() => {
            if (currentTextIndex >= message.length) {
                if (hasFinished === true) {
                    return;
                }
                setHasFinished(true);
                const finish = setTimeout(() => { onFinish() }, finishDelayTime)
                return () => clearTimeout(finish);
            }
            else {
                setCurrentTextIndex(currentTextIndex + 1);
            }
        }, writeTimeMilliseconds / message.length);
        return () => clearInterval(interval);
    }, [animated,currentTextIndex, writeTimeMilliseconds, message, onFinish, finishDelayTime, hasFinished]);
    /*eslintenable*/


    return (
        <div className='message' ref={messageRef}  >
            {message.substr(0, currentTextIndex)}
        </div>
    );
}

export default Message;