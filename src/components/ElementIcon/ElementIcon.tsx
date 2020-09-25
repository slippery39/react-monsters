import React from 'react';
import './ElementIcon.css'
import {ElementType} from '../../game/interfaces';



interface Props {
    element:ElementType
}

const ElementIcon: React.FunctionComponent<Props> = (props) => {

    const classes = `element-icon element-${props.element.toString().toLowerCase()}`

    return (
        <div className={classes}>
            {props.element.toString()}
        </div>
    );
}

export default ElementIcon