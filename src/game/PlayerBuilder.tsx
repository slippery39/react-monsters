import { Item, Player, Status } from "./interfaces";
import {GetPokemon} from "./Pokemon/PremadePokemon";
import {GetItem} from "./PremadeItems";
import _ from "lodash";
import { PokemonBuilder } from "./Pokemon/Pokemon";

export class PlayerBuilder{

    private player:Player;

    constructor(id:number){
        this.player = {
            id:id, //id's will be assigned by the game itself.
            name:"",
            pokemon:[],
            currentPokemonId:-1, //id's will be assigned by the game itself
            items:[]
        }
    }
    WithName(name:string) : PlayerBuilder {
        this.player.name = name;
        return this;
    }
    WithPokemon(name:string) : PlayerBuilder{         
        const builder = new PokemonBuilder();        
        let pokemon = builder.OfSpecies(name).Build();
        pokemon.id = -1; //gets a new id from the game
        pokemon.status = Status.None
        this.player.pokemon.push( pokemon );
        return this;
    }
    WithItem(name:string,quantity:number) : PlayerBuilder{
        const baseItem = GetItem(name);        
        //item converted for use in the game
        let newItem : Item = {...baseItem,...{"id":-1,"quantity":quantity}}
        this.player.items.push(newItem)
        return this;
    }
    Build() : Player {
        return _.cloneDeep(this.player);
    }
}