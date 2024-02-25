/**
 * Contains the business logic for managing players, such as creating a player, updating a player's state, and handling player events.
 */
import { Inject, Service } from 'typedi';
import Game from '@domain/Entity/Game';
import PlayerFactory from '@domain/Service/PlayerFactory';
import Player, { PlayerSettings } from '@domain/Entity/Player';

@Service()
export default class PlayerService {
    @Inject()
    private playerFactory!: PlayerFactory;

    createPlayer(playerSettings: PlayerSettings): Player {
        return this.playerFactory.createPlayer(playerSettings);
    }
}
