import { detailedDiff } from 'deep-object-diff';
import { GameState } from '../../public/js/module/GameState.js';

export class ServerGameState extends GameState{
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
