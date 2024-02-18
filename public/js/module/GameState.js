export class GameState {
    static STATE_NAME = {
        WAITING: 'waiting',
        PLAYING: 'playing',
    };

    constructor(stateValues = {}) {
        // TODO: consider moving player metadata to a separate place and only keep snake position related info
        this.snakes = stateValues.snakes || {};

        this.stateName = stateValues.stateName || GameState.STATE_NAME.WAITING;
        this.apple = stateValues.apple || null;
        this.activePlayers = stateValues.activePlayers || 0;
        this.grid = stateValues.grid || [];
        this.intervalTime = stateValues. intervalTime || 0;
    }

    reset() {
        this.stateName = GameState.STATE_NAME.WAITING;
        this.apple = null;
        this.activePlayers = 0;
        this.grid = [];
        this.intervalTime = 0;
    }

    mergeDiff(diff) {
        this.traverseAndSet(this, diff.added);
        this.traverseAndSet(this, diff.updated);
        this.deleteProperties(this, diff.deleted);
    }

    traverseAndSet(obj, diffObj) {
        if (diffObj === undefined || diffObj === null) return;

        Object.keys(diffObj).forEach(key => {
            if (typeof diffObj[key] === 'object') {
                if (!obj[key]) {
                    obj[key] = {};
                }
                this.traverseAndSet(obj[key], diffObj[key]);
            } else {
                if (Array.isArray(obj[key])) {
                    obj[key].splice(parseInt(key), 0, diffObj[key]);
                } else {
                    obj[key] = diffObj[key];
                }
            }
        });
    };

    deleteProperties(target, diffObj) {
        Object.keys(diffObj).forEach(key => {
            const value = diffObj[key];
            if (typeof value === 'object' && value !== null) {
                this.deleteProperties(target[key], value);
            } else {
                this.deleteFromTarget(target, key);
            }
        });
    };

    deleteFromTarget(target, key) {
        if (Array.isArray(target)) {
            target.splice(key, 1);
        } else {
            delete target[key];
        }
    };
}
