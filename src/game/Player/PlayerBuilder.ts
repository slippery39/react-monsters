import { GetItem } from "../Items/PremadeItems";
import _ from "lodash";
import { Status } from "../HardStatus/HardStatus";
import GetPokemon, { GetMultipleRandomPokemon } from "../Pokemon/PremadePokemon";
import { Item } from "game/Items/Item";
import { Pokemon } from "game/Pokemon/Pokemon";

export interface Player {
    name: string,
    pokemon: Array<Pokemon>,
    currentPokemonId: number,
    items: Array<Item>
    id: number
}


export class PlayerBuilder {

    private player: Player;

    constructor(id: number) {

        this.player = {
            id: id, //id's will be assigned by the game itself.
            name: "",
            pokemon: [],
            currentPokemonId: -1, //id's will be assigned by the game itself
            items: []
        }
    }
    WithName(name: string): PlayerBuilder {
        this.player.name = name;
        return this;
    }
    WithPokemon(name: string): PlayerBuilder {

        let pokemon = GetPokemon(name);
        pokemon.id = -1; //gets a new id from the game
        pokemon.status = Status.None
        this.player.pokemon.push(pokemon);
        return this;
    }
    WithRandomPokemon(amount:number):PlayerBuilder{
        const randomPokemon = GetMultipleRandomPokemon(amount);
        this.player.pokemon =this.player.pokemon.concat(randomPokemon);
        return this;
    }
    WithItem(name: string, quantity: number): PlayerBuilder {
        const baseItem = GetItem(name);
        //item converted for use in the game
        let newItem: Item = { ...baseItem, ...{ "id": -1, "quantity": quantity } }
        this.player.items.push(newItem)
        return this;
    }
    WithCustomPokemon(pokemon: Pokemon): PlayerBuilder {
        this.player.pokemon.push(pokemon);
        return this;
    }
    Build(): Player {
        return _.cloneDeep(this.player);
    }
}