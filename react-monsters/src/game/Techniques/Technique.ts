import { BattleEffect } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";
import { BaseTechnique, GetTech } from "./PremadeTechniques";



export enum DamageType {
    Physical = 'physical',
    Special = 'special',
    Status = 'status'
}


//May need to indicate al
export interface Technique extends BaseTechnique {
    id: number,
    currentPP: number,
    accuracy: number,
}

export function DecrementPP(technique:Technique){
    technique.currentPP = Math.max(0,technique.currentPP-1);
}

//A way to build techniques a little easier while we are testing.
class _TechniqueBuilder {

    private technique: Technique;

    constructor() {

        const defaultPP = 20;

        this.technique = {
            id: -1,
            name: "NewTechnique",
            accuracy: 100,
            description: "Technique-Description",
            power: 0,
            pp: defaultPP,
            currentPP: defaultPP,
            damageEffect: undefined,
            damageType: DamageType.Physical,
            elementalType: ElementType.Normal,
            effects: [],
        }
    }

    PremadeMove(name:string): _TechniqueBuilder{
        this.technique = GetTech(name);
        return this;        
    }

    OfDamageType(type: DamageType): _TechniqueBuilder {
        this.technique.damageType = type;

        if (type !== DamageType.Status) {
            if (this.technique.power === 0) {
                this.technique.power = 60 //set a default power just in case;
            }
        }
        else{
            this.technique.power = 0;
        }

        return this;
    }
    OfElementalType(elementalType: ElementType): _TechniqueBuilder {
        this.technique.elementalType = elementalType;
        return this;
    }
    WithEffects(effects: Array<BattleEffect>): _TechniqueBuilder {
        this.technique.effects = [...effects]
        return this;
    }
    WithPower(power: number): _TechniqueBuilder {
        this.technique.power = power;
        return this;
    }
    Build(): Technique {
        //some error checking here
        if (this.technique.damageType === DamageType.Status) {
            if (this.technique.power !== 0) {
                throw new Error(`Power was specified for a status move while using Technique Builder, this was likely an error. Please fix. Name of Move : ${this.technique.name}`);
            }
        }
        else {
            if (this.technique.power === 0) {
                throw new Error(`There was no power specified for a damaging move while using Technique Builder, this was likely an error. Please fix. Name of Move : ${this.technique.name}`);
            }
        }

        return this.technique;
    }
}

export function TechniqueBuilder(){
    return new _TechniqueBuilder();
}
