import 'reflect-metadata';
import { Socket } from "socket.io-client";
import Snake from './Presentation/Snake';
import Apple from './Presentation/Apple';
import { GameSettings } from "@domain/Entity/Game";
import GameState, { GameStateName } from "@domain/ValueObject/GameState";
import Container from "typedi";
import GameStateDiffer from "@domain/Service/GameStateDiffer";
import { PlayerMetadata } from "@domain/Entity/Player";

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
    settings!: GameSettings;
    state: GameState = new GameState();
    players: PlayerMetadata[] = [];
    snakeUnit: number = 20;

    constructor (socket: Socket) {
        this.socket = socket;
    }

    initialize () {
        // Set up client event listeners
        this.socket.on('connected', (response: {state: GameState, settings: GameSettings, players: PlayerMetadata[]}) => {
            console.log('connected', response);
            this.settings = response.settings;
            Snake.initialize(this.settings.columns, this.settings.columns * this.snakeUnit, this.settings.rows * this.snakeUnit, this.canvasContainer);
            Apple.initialize(this.settings.columns * this.snakeUnit, this.settings.rows * this.snakeUnit, this.canvasContainer);

            this.createBoard();
            this.syncPlayers(response.players);
            this.syncState(response.state);

            // MVP
            this.checkJoin();
        });

    
        this.socket.on('disconnect', () => {
            console.log('disconnected');
            window.location.reload(); // TODO: instead of reloading the page, either don't even start rendering it or reconnect the player somehow
        });

        // TODO: consider renaming to "sync-game" or similar
        this.socket.on('sync-state', (response: {state: GameState, players: PlayerMetadata[]}) => {
            this.syncPlayers(response.players);
            this.syncState(response.state);
        });

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
            if (this.state.stateName !== GameStateName.PLAYING) return;

            if (this.socket.id) {
                Snake.control(e, this.state.players[this.socket.id], this.settings.columns, this.socket);
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
        const canJoin = (Object.keys(this.state.players).length < this.settings.numOfPlayers);
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

    syncState (state: GameState) {
        console.log('syncing new state', state);
        this.state = state;

        this.syncGame();
    }

    syncPlayers (players: PlayerMetadata[]) {
        console.log('syncing players', players);
        this.players = players;
        this.listPlayers();
    }

    syncStateDiff (stateDiff: any) {
        console.log('syncing new state diff', stateDiff);
        Container.get(GameStateDiffer).mergeDiff(this.state, stateDiff);
        this.syncGame();
    }

    syncGame () {
        let i = 0;
        for (const [id, playerState] of Object.entries(this.state.players)) {
            const ease = this.state.stateName === GameStateName.PLAYING; // TODO: players should be able to turn off easing animation
            Snake.render(playerState, id, this.settings.columns, ease);
        };

        if (this.state.collectible) {
            Apple.renderApple(this.state.collectible, this.settings.columns);
        }

        this.refreshScore(false);
    }

    endGame () {
        if (this.socket.id && this.state.players[this.socket.id]) {
            this.btnReadyCheck.style.display = "inline-block";
        } else {
            this.checkJoin();
        }

        this.refreshScore(true);
    }

    listPlayers() {
        this.scoreDisplay.innerHTML = "";
        for (let i = 0; i < this.settings.numOfPlayers; i++) {
            const player = this.players[i];
            const row = document.createElement("tr");
            if (player) {
                row.setAttribute("id", "player-" + player.id);
                row.style.color = player.color;
                row.innerHTML = `<th>${encodeURIComponent(player.username)}<span class="player-state"></span></th><td class="score"></td>`;
            } else {
                row.innerHTML = "<th>Waiting for player...</th><td></td>";
            }
            this.scoreDisplay.appendChild(row);
        }
    }

    refreshScore (endGame = false) {
        let topScore = this.determineTopScore();
        
        for (const [playerId, playerState] of Object.entries(this.state.players)) {
            const row = document.getElementById("player-" + playerId)!;

            if (endGame && playerState.currentScore > 0 && playerState.currentScore === topScore) {
                row.classList.add("winner");
            } else {
                row.classList.remove("winner");
            }
            
            if (this.state.stateName === GameStateName.WAITING) {
                row.querySelector(".player-state")!.innerHTML = playerState.readyCheck ? " (ready)" : "(not ready)";
            } else {
                row.querySelector(".player-state")!.innerHTML = "";
            }

            row.querySelector(".score")!.innerHTML = playerState.currentScore.toString();
        }
    }

    determineTopScore () {
        let scores = Object.values(this.state.players).map((player: any) => player.currentScore);
        let topScore = Math.max(...scores);
        
        return topScore;
    }
}