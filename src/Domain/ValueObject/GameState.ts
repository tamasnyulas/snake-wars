import PlayerState from "@domain/ValueObject/PlayerState";
import CollectibleState from "./CollectibleState";

export default class GameState {
    players: { [playerId: string]: PlayerState } = {};
    stateName: GameStateName = GameStateName.WAITING;
    collectible: CollectibleState = new CollectibleState();
    activePlayers: number = 0;
    grid: number[] = [];
    intervalTime: number = 0;

    reset() {
        this.stateName = GameStateName.WAITING;
        this.collectible = new CollectibleState();
        this.activePlayers = 0;
        this.grid = [];
        this.intervalTime = 0;
    }
}

export enum GameStateName {
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
}
