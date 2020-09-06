import React, { useEffect, useState, useRef } from "react";
import { TweenLite } from "gsap";


interface Props{
    number:number
}

const Number : React.FunctionComponent<Props> = props => {

  const [total, setTotal] = useState(props.number);
  //note we are mutating this value directly to have it work with TweenLite.
  //const [numAnimation, setNumAnimation] = useState<TweenMax>();
  
  const value = useRef({value:props.number});
    
  
  useEffect(() => {
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
