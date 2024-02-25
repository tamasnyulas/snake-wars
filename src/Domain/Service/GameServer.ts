import { Service } from 'typedi';
import Game from '@domain/Entity/Game';

@Service()
export default class GameServer {
    public readonly games: { [gameId: string]: Game } = {};
    public readonly maxGameCount: number = parseInt(process.env.MAX_GAME_COUNT || '10');

    canCreateGame (): boolean {
        return Object.keys(this.games).length < this.maxGameCount;
    }

    registerNewGame (game: Game): void {
        this.games[game.gameId] = game;
    }

    deleteGame (gameId: string): void {
        // TODO: do we need to call Game.dispose() or similar to take any actions?
        delete this.games[gameId];
    }
}