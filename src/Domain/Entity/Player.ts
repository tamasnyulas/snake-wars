import PlayerState from "@domain/ValueObject/PlayerState";

/**
 * Represents a player entity with properties like name, score, and current position.
 */
export default class Player {
    readonly state: PlayerState;
    readonly id: string;
    readonly username: string;
    readonly color: string;

    constructor (settings: PlayerSettings) {
        this.state = new PlayerState();

        this.id = settings.id;
        this.username = settings.username;
        this.color = settings.color;
    }

    getMetadata (): PlayerMetadata {
        return {
            id: this.id,
            username: this.username,
            color: this.color,
        };
    }
    
    resetState () {
        this.state.reset();
    }

    score (value: number) {
        this.state.growth += value;
        this.state.currentScore += value;
    }

    move () {
        if (this.state.newDirection) {
            this.state.previousDirection = this.state.currentDirection;
            this.state.currentDirection = this.state.newDirection;
            this.state.newDirection = null;
        }

        this.state.previousPosition = [...this.state.currentPosition];

        // Add new head
        this.state.currentPosition.unshift(this.state.currentPosition[0] + this.state.currentDirection);
        
        if (this.state.growth > 0) {
            // Grow player
            this.state.growth--;
        } else {
            // Remove tail
            this.state.currentPosition.pop();
        }

        return this.state.currentPosition[0]; // return the new head index
    }

    checkForHits (grid: number[], columns: number, rows: number) {
        const direction = this.state.newDirection || this.state.currentDirection;

        const hitBottom = this.state.currentPosition[0] + columns >= columns * rows && direction === columns;
        const hitRight = this.state.currentPosition[0] % columns === columns - 1 && direction === 1;
        const hitLeft = this.state.currentPosition[0] % columns === 0 && direction === -1;
        const hitTop = this.state.currentPosition[0] - columns < 0 && direction === -columns;
        const hitOtherPlayer = grid[this.state.currentPosition[0] + direction] !== 0;

        if (hitBottom || hitRight || hitLeft || hitTop || hitOtherPlayer) {
            this.state.canMove = false;

            return true;
        } else {
            return false;
        }
    }

    changeDirection (direction: string, columns: number) { // TODO: "columns" could go to class property when the player is initialized
        if (direction === 'right' && this.state.currentDirection !== -1) {
            this.state.newDirection = 1;
        } else if (direction === 'up' && this.state.currentDirection !== columns) {
            this.state.newDirection = -columns;
        } else if (direction === 'left' && this.state.currentDirection !== 1) {
            this.state.newDirection = -1;
        } else if (direction === 'down' && this.state.currentDirection !== -columns) {
            this.state.newDirection = columns;
        }
    }
}

export type PlayerSettings = {
    id: string;
    username: string;
    color: string;
}

export type PlayerMetadata = {
    id: string;
    username: string;
    color: string;
}