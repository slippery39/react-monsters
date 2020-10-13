import React, { useEffect, useState, useRef } from "react";
import { TweenLite } from "gsap";


interface Props{
    number:number,
    animate?:boolean
  }

const Number : React.FunctionComponent<Props> = props => {

  const [total, setTotal] = useState(props.number);
  //note we are mutating this value directly to have it work with TweenLite.
  //const [numAnimation, setNumAnimation] = useState<TweenMax>();
  
  const value = useRef({value:props.number});
    
  useEffect(()=>{
    if (props.animate===false){
      setTotal(Math.floor(props.number));
    }
  },[props.number])
  
  useEffect(() => {

    if (props.animate === false){
      return;
    }
      
    TweenLite.to(value.current, 2, {
      value: props.number,
      roundProps: "value",
      onUpdate: () => {
          setTotal(value.current.value)
      },      
    });
  }, [props.number]);
  
  
  
  return (
       <span>{total}</span>
  );
};

export default Number;
