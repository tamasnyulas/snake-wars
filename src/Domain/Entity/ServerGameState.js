import { detailedDiff } from 'deep-object-diff';
import GameState from './GameState.js';

export default class ServerGameState extends GameState // TODO: consider renaming this class to make it decoupled from Server domain
{
    #previousState;

    reset() {
        super.reset();

        this.#previousState = JSON.parse(JSON.stringify(this));
    }

    purgeDiff() {
        const diff = detailedDiff(this.#previousState, JSON.parse(JSON.stringify(this)));

        this.#previousState = JSON.parse(JSON.stringify(this));

        return diff;
    }
}
