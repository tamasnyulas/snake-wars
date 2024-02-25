import { Service } from 'typedi';
import Game, { GameSettings } from '@domain/Entity/Game';
import { InitialPlayerState } from '@domain/ValueObject/PlayerState';

@Service()
export default class GameFactory {
    private initialPlayerSize: number = 3;
    private gameIds: string[] = [];

    createGame (settings: GameSettings, emitter: (gameId: string, event: string, params: any) => void): Game {
        const gameId = this.createGameId();
        const initialPlayerStates = this.calcInitialPlayerStates(settings);

        return new Game(gameId, settings, initialPlayerStates, emitter);
    }

    private createGameId (): string {
        let gameId = this.generateRandomString(8);

        while (this.gameIds.includes(gameId)) {
            gameId = this.generateRandomString(8);
        }

        return gameId;
    }

    private generateRandomString(length: number): string {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';
        for (let i = 0; i < length; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return randomString;
    }

    /**
     * Based on the rows, columns and the defined max player count, calculate the initial positions and directions for all players
     * 
     * TODO: consider rows and columns to calculate how many players should be in a row/column and where they start moving
     */
    private calcInitialPlayerStates(settings: GameSettings): InitialPlayerState[] {
        const { numOfPlayers, columns, rows } = settings;
        const totalCells = rows * columns;
        let segmentLength = 0;
        if (numOfPlayers > 1) {
            segmentLength = (totalCells - (this.initialPlayerSize * numOfPlayers)) / (numOfPlayers - 1);
        }
        const initialPlayerStates: InitialPlayerState[] = [];

        for (let i = 0; i < numOfPlayers; i++) {
            const initialPosition = [];
            const direction = i % 2 === 0 ? 1 : -1;
            const startingPosition = (direction === -1 ? columns - this.initialPlayerSize : 0);

            for (let j = 0; j < this.initialPlayerSize; j++) {
                let cellIndex = Math.floor((i * (segmentLength + this.initialPlayerSize)) / columns) * columns + startingPosition + j;
                cellIndex = (cellIndex % totalCells + totalCells) % totalCells;
                direction === 1 ? initialPosition.unshift(cellIndex) : initialPosition.push(cellIndex);
            }

            initialPlayerStates.push(new InitialPlayerState(initialPosition, direction));
        }

        return initialPlayerStates;
    }
    
}