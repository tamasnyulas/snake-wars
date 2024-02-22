import { Socket } from "socket.io-client";
import Snake from './Presentation/Snake';
import Apple from './Presentation/Apple';
import GameState from '@domain/Entity/GameState';

/**
 * GameClient responsibilities: 
 * - Initialize the game client
 * - Set up client event listeners
 * - Handle user input
 * - Sync the game state
 * - End the game
 * - Refresh the score
 * - Determine the top score
 * - Check if a user can join the game
 * - Join the game
 * - Handle ready check
 * - Create the game board
 */
export default class GameClient {
    canvasContainer: any = document.querySelector(".canvasContainer");
    touchControlPanel: any = document.querySelector(".touchControlPanel");
    popup: any = document.querySelector(".popup");
    joinGameForm: any = document.querySelector(".joinGameForm");
    usernameInput: any = document.querySelector("input[name='username']");
    btnReadyCheck: any = document.querySelector(".readyCheck");
    scoreDisplay: any = document.querySelector(".scoreDisplay");
    isTouchScreen: boolean = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    socket: Socket;
    settings: any;
    state: GameState = new GameState();
    snakeUnit: number = 20;

    constructor (socket: Socket) {
        this.socket = socket;
    }

    initialize () {
        // Set up client event listeners
        this.socket.on('connected', (response) => {
            console.log('connected', response);
            this.settings = response.settings;
            Snake.initialize(this.settings.columns, this.settings.columns * this.snakeUnit, this.settings.rows * this.snakeUnit, this.canvasContainer);
            Apple.initialize(this.settings.columns * this.snakeUnit, this.settings.rows * this.snakeUnit, this.canvasContainer);

            this.createBoard();
            this.syncState(response.state);

            // MVP
            this.checkJoin();
        });

        this.socket.on('disconnect', () => {
            console.log('disconnected');
            window.location.reload(); // TODO: instead of reloading the page, either don't even start rendering it or reconnect the player somehow
        });

        this.socket.on('sync-state', (state) => this.syncState(state));

        this.socket.on('sync-state-diff', (stateDiff) => this.syncStateDiff(stateDiff));

        this.socket.on('start-game', (state) => {
            console.log('The game is starting');
            this.createBoard();
            this.syncState(state);
        });

        this.socket.on('end-game', (state) => {
            console.log('The game is ending');
            this.syncState(state);
            this.endGame();
        });

        this.bindControlEventListeners();
    }

    bindControlEventListeners () {
        this.joinGameForm.addEventListener("submit", this.joinGame.bind(this));
        this.btnReadyCheck.addEventListener("click", this.readyCheck.bind(this));

        // TODO: ensure that non-players can't control the game
        document.addEventListener("keydown", (e) => {
            if (this.state.stateName !== GameState.STATE_NAME.PLAYING) return;

            if (this.socket.id) {
                Snake.control(e, this.state.snakes[this.socket.id], this.settings.columns, this.socket);
            }
        });

        if (this.isTouchScreen) {
            ["up", "down", "left", "right"].forEach(direction => {
                const button: any = document.querySelector("." + direction);
                if (button !== null) {
                    button.addEventListener("click", () => {
                        const event = new KeyboardEvent("keydown", { key: "Arrow" + direction.charAt(0).toUpperCase() + direction.slice(1) });
                        document.dispatchEvent(event);
                    });
                }
            });
        }
    }

    // TODO: This should be called when a user joins or leaves the game
    checkJoin () {
        const canJoin = (Object.keys(this.state.snakes).length < this.settings.players);
        this.joinGameForm.style.display = canJoin ? "inline-block" : "none";
        if (canJoin) {
            this.usernameInput.focus();
        }
    }

    joinGame (e: Event) {
        e.preventDefault();

        if (!this.usernameInput.checkValidity()) {
            this.usernameInput.reportValidity();
            return;
        } 

        const preferences = {
            username: this.usernameInput.value,
        };
        
        const joinPromise = (async (preferences) => {
            console.log('joining game', preferences);
            return await this.socket.emitWithAck('join-game', preferences);
        })(preferences);

        joinPromise.then(response => {
            if (response.isSuccess === false) {
                console.log('Join failed:', response.error);
                return;
            }

            // Handle successful response
            this.joinGameForm.style.display = "none";
            this.btnReadyCheck.style.display = "inline-block";
            this.btnReadyCheck.focus();
            
            if (this.isTouchScreen) {
                this.touchControlPanel.style.display = "block";
            }
        })
        .catch(error => {
            // Handle error
            console.error('Join error:', error);
        });
    }

    readyCheck () {
        this.socket.emit('ready-check', true);

        this.btnReadyCheck.style.display = "none";
    }

    // TODO: There's a glitch regarding the snake tail rendering on the initial position
    createBoard () {
        this.canvasContainer.style.width = this.settings.columns * this.snakeUnit;
        this.canvasContainer.style.height = this.settings.rows * this.snakeUnit;

        this.joinGameForm.style.display = "none";
        this.btnReadyCheck.style.display = "none";
    }

    syncState (state: any) {
        console.log('syncing new state', state);
        this.state = new GameState(state);
        this.syncGame();
    }

    syncStateDiff (stateDiff: any) {
        console.log('syncing new state diff', stateDiff);
        this.state.mergeDiff(stateDiff);
        this.syncGame();
    }

    syncGame () {
        for (const [id, snakeState] of Object.entries(this.state.snakes)) {
            Snake.render(snakeState, id, this.settings.columns);
        };

        if (this.state.apple) {
            Apple.renderApple(this.state.apple, this.settings.columns);
        }

        this.refreshScore(false);
    }

    endGame () {
        if (this.socket.id && this.state.snakes[this.socket.id]) {
            this.btnReadyCheck.style.display = "inline-block";
        } else {
            this.checkJoin();
        }

        this.refreshScore(true);
    }

    refreshScore (endGame = false) {
        let topScore = this.determineTopScore();
        this.scoreDisplay.innerHTML = "";

        Object.values(this.state.snakes).forEach((snake: any, index) => {
            const row = document.createElement("tr");
            row.style.color = snake.color;

            if (endGame && snake.currentScore > 0 && snake.currentScore === topScore) {
                row.classList.add("winner");
            }

            let username = encodeURIComponent(snake.username);
            if (this.state.stateName === GameState.STATE_NAME.WAITING)  {
                const readyCheck = snake.readyCheck ? " (ready)" : "";
                username += ` ${readyCheck}`;
            }

            // TODO: add color to each name identical to their snakes
            row.innerHTML = `<th>${username}</th><td>${snake.currentScore}</td>`;
            this.scoreDisplay.appendChild(row);
        });
    }

    determineTopScore () {
        let scores = Object.values(this.state.snakes).map((snake: any) => snake.currentScore);
        let topScore = Math.max(...scores);
        
        return topScore
    }
}