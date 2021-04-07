import styled, { keyframes } from 'styled-components';


export const Title = styled.h1`
    padding-top:12px;
    font-weight:bold;
`;



export const PartySelectionContainer = styled.div`
display:flex;
flex-wrap:wrap;
border-radius: 0px;
background: #fefbfb;
box-shadow: inset 8px 8px 16px #d8d5d5, inset -8px -8px 16px #ffffff;
min-height:42px;
`

const bouncy = keyframes`
0%   { transform: scale(1,1)      translateY(0); }
10%  { transform: scale(1.1,.9)   translateY(0); }
30%  { transform: scale(.9,1.1)   translateY(-10px); }
50%  { transform: scale(1.05,.95) translateY(0); }
57%  { transform: scale(1,1)      translateY(-2px); }
64%  { transform: scale(1,1)      translateY(0); }
100% { transform: scale(1,1)      translateY(0); }
`


//Only used with the pokeball for now.
export const Bouncy = styled.div`
    display:inline-block;
    width:20px;
    height:20px;
    animation-name: ${bouncy};
    animation-duration: 2s;
    animation-iteration-count: infinite;
    transform-origin:bottom;
    animation-timing-function: cubic-bezier(0.280, 0.840, 0.420, 1);
`;



export default Title;