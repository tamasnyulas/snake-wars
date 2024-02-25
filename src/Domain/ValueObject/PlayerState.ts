export default class PlayerState {
    initialPlayerState: InitialPlayerState | null = null;
    canMove: boolean = true;
    currentPosition: Array<number> = [];
    currentDirection: number = 0;
    previousPosition: Array<number> = [];
    previousDirection: number = 0;
    newDirection: number | null = null; // TODO: does this belong here or into Player.ts?
    size: number = 0;
    currentScore: number = 0;
    growth: number = 0;
    readyCheck: boolean = false;

    setInitialState (initialPlayerState: InitialPlayerState): void {
        this.initialPlayerState = initialPlayerState;
        
        this.currentPosition = [...initialPlayerState.initialPosition];
        this.currentDirection = initialPlayerState.initialDirection;
        this.previousPosition = [...initialPlayerState.initialPosition];
        this.previousDirection = initialPlayerState.initialDirection;
        this.size = initialPlayerState.initialPosition.length;
    }

    reset (): void {
        if (!this.initialPlayerState) {
            throw new Error('Initial player state not set.');
        }

        this.currentPosition = [...this.initialPlayerState.initialPosition];
        this.currentDirection = this.initialPlayerState.initialDirection;
        this.previousPosition = [...this.initialPlayerState.initialPosition];
        this.previousDirection = this.initialPlayerState.initialDirection;
        this.size = this.initialPlayerState.initialPosition.length;
        this.newDirection = null;
        this.growth = 0;
        this.currentScore = 0;
        this.canMove = true;
        this.readyCheck = false;
    }
}

export class InitialPlayerState {
    initialPosition: Array<number> = [];
    initialDirection: number = 0;

    constructor(initialPosition: Array<number>, initialDirection: number) {
        this.initialPosition = initialPosition;
        this.initialDirection = initialDirection;
    }
}