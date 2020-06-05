import React from 'react';
import './HealthBar.css'
import CSS from 'csstype';

interface Props {
    value: Number
}

const HealthBar: React.FunctionComponent<Props> = (props) => {

    let backgroundColor: string;
    if (props.value <= 20) {
        backgroundColor = 'red';
    }
    else if (props.value <= 50) {
        backgroundColor = 'yellow';
    }
    else {
        backgroundColor = 'green';
    }

    const healthBarStyle: CSS.Properties = {
        backgroundColor: backgroundColor,
        width: props.value + '%',
        height: '100%'
    }

    return (
        <div className="healthbar" style={{ width: '100px', height: '10px', display: 'inline-block', border: '1px solid black' }}>
            <div style={healthBarStyle} className="healthbar-fill"> </div>
        </div>
    );
}

export default HealthBar;