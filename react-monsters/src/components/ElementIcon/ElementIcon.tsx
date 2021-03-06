import React from 'react';
import './ElementIcon.css'
import { ElementType } from 'game/ElementType';

interface Props {
    element: ElementType,
}

const ElementIcon: React.FunctionComponent<Props> = (props) => {

    let classes = `element-icon element-${props.element.toString().toLowerCase()}`

    return (
        <span className={classes}>
            {props.element.toString()}
        </span>
    );
}

export default ElementIcon