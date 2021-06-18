import React from 'react'

interface Props {
    onReturnClick: () => void;
}

const GameOverScreen: React.FunctionComponent<Props> = (props) => {
    return (
        <div className="game-over-screen" style={{ width: '100%' }}>
            <div style={{ margin: "0 auto", marginTop: "10px", marginBottom: "10px" }} onClick={() => { if (props.onReturnClick) { props.onReturnClick() } }} className="cancel-button"> Return to menu </div>
        </div>
    );
}


export default GameOverScreen