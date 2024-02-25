import Game from "./Game";
import CollectibleState from "@domain/ValueObject/CollectibleState";
import CollectibleFactory from "@domain/Service/CollectibleFactory";
import Container from "typedi";
import Player from "./Player";

export default class GameEventLoop {
    private interval: any = null;
    private minInterval: number = 50;

    constructor(private game: Game) {}

    start(intervalTime: number): void {
        this.interval = setInterval(this.gameEventLoop.bind(this), intervalTime);
    }

    stop(): void {
        clearInterval(this.interval);
    }

    private gameEventLoop(): void {
        let chrashed = false;

        Object.values(this.game.players).forEach((player, i) => {
            if (!player.state.canMove) return;

            if (player.checkForHits(this.game.state.grid, this.game.settings.columns, this.game.settings.rows)) {
                this.game.state.activePlayers--;
                chrashed = true;
            }
        });

        if (chrashed && (this.game.settings.endEarly || this.game.state.activePlayers < 1)) {
            this.game.endGame();

            return;
        }

        Object.values(this.game.players).forEach((player: Player) => {
            if (!player.state.canMove) return;

            const headIndex = player.move();
            this.game.state.grid[headIndex] = 1;

            let previousTailIndex = player.state.previousPosition[player.state.previousPosition.length - 1];
            if (previousTailIndex !== player.state.currentPosition[player.state.currentPosition.length - 1]) {
                this.game.state.grid[previousTailIndex] = 0;
            }

            if (this.game.state.collectible && headIndex === this.game.state.collectible.position) {
                this.collect(player, this.game.state.collectible);
            }
        });

        this.game.purgeStateDiff();
    }

    collect(player: Player, collectible: CollectibleState): void {
        player.score(collectible.value);

        if (collectible.speedBomb) {
            this.increaseSpeed();
        }

        this.game.state.collectible = Container.get(CollectibleFactory).createOnGrid(this.game.state.grid)
    }

    increaseSpeed(): void {
        let newIntervalTime = Math.floor(this.game.state.intervalTime * this.game.settings.speedIncrement);

        if (newIntervalTime <= this.minInterval) return;

        clearInterval(this.interval);
        this.game.state.intervalTime = newIntervalTime;
        this.interval = setInterval(this.gameEventLoop.bind(this), this.game.state.intervalTime);
    }
}