import Game from "@domain/Entity/Game";
import Player, { PlayerSettings } from "@domain/Entity/Player";
import { InitialPlayerState } from "@domain/ValueObject/PlayerState";
import { Service } from "typedi";

@Service()
export default class PlayerFactory {
    
    createPlayer(playerSettings: PlayerSettings) {
        return new Player(playerSettings);
    }
}