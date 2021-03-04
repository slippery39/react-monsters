import { isConstructorDeclaration } from "typescript";

export default function waitForSeconds(seconds:number):Promise<void>{
    return new Promise<void>(resolve =>{
        setTimeout(()=>{resolve();},seconds*1000);
    })
}


export async function waitForSecondsExample(): Promise<void>{
    for (var i=0;i<9999999;i++){
        console.log("wooo",i);
        await waitForSeconds(1);
    }
}