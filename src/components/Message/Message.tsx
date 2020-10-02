import React, { useState, useEffect } from 'react';
import './Message.css';


interface Props {
    message?: String,
    writeTimeMilliseconds?: number,
    finishDelayTime?: number,
    onFinish?(): any
}

const Message: React.FC<Props> = ({ message = '', writeTimeMilliseconds = 1000, finishDelayTime = 1000, onFinish = () => { } }: Props,) => {

    //instantly show the message if the writeTime is set to 0
    const [currentTextIndex, setCurrentTextIndex] = useState(writeTimeMilliseconds === 0 ? message.length : 0);
    const [hasFinished, setHasFinished] = useState(false);
    useEffect(function () {
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
    }, [currentTextIndex, writeTimeMilliseconds, message, onFinish, finishDelayTime, hasFinished]);


    return (
        <div className='message' >
            {message.substr(0, currentTextIndex)}
        </div>
    );
}

export default Message;