import { detailedDiff } from 'deep-object-diff';
import GameState from './GameState';

export default class ServerGameState extends GameState // TODO: consider renaming this class to make it decoupled from Server domain
{
    #previousState: GameState | null = null;

    reset() {
        super.reset();

        this.#previousState = JSON.parse(JSON.stringify(this));
    }

    purgeDiff() {
        const diff = detailedDiff(this.#previousState as object, JSON.parse(JSON.stringify(this)));

        this.#previousState = JSON.parse(JSON.stringify(this));

        return diff;
    }
}
