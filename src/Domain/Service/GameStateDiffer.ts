import GameState from "@domain/ValueObject/GameState";
import { Service } from "typedi";

@Service()
export default class GameStateManager {

    mergeDiff(state: GameState, diff: {added: any, updated: any, deleted: any}) {
        this.traverseAndSet(state, diff.added);
        this.traverseAndSet(state, diff.updated);
        this.deleteProperties(state, diff.deleted);
    }

    private traverseAndSet(obj: any, diffObj: any) {
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
    }

    private deleteProperties(target: any, diffObj: any) {
        Object.keys(diffObj).forEach(key => {
            const value = diffObj[key];
            if (typeof value === 'object' && value !== null) {
                this.deleteProperties(target[key], value);
            } else {
                this.deleteFromTarget(target, key);
            }
        });
    }

    private deleteFromTarget(target: any, key: any) {
        if (Array.isArray(target)) {
            target.splice(key, 1);
        } else {
            delete target[key];
        }
    }
}
