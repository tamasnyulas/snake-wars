import { Snake } from './Snake.js';
import { Apple } from './Apple.js';
import { GameState } from './GameState.js';

export const GameClient = {
    board: document.querySelector(".board"),
    popup: document.querySelector(".popup"),
    joinGameForm: document.querySelector(".joinGameForm"),
    usernameInput: document.querySelector("input[name='username']"),
    btnReadyCheck: document.querySelector(".readyCheck"),
    scoreDisplay: document.querySelector(".scoreDisplay"),
    isTouchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
    //grid: null,
    socket: null,
    settings: null,
    state: new GameState(),
    snakeUnit: 20,
    touchControlPanel: document.querySelector(".touchControlPanel"),
    canvasContainer: document.querySelector(".canvasContainer"),
    /*canvas: document.querySelector("#gameCanvas"),
    appleCanvas: document.querySelector("#appleCanvas"),
    canvasContext: null,
    appleCanvasContext: null,*/

    initialize: function (socket) {
        this.socket = socket;
        //this.canvasContext = this.canvas.getContext("2d");
        //this.appleCanvasContext = this.appleCanvas.getContext("2d");

        // Set up client event listeners
        socket.on('connected', (response) => {
            console.log('connected', response);
            this.settings = response.settings;
            Snake.initialize(this.settings.columns, this.settings.columns * this.snakeUnit, this.settings.rows * this.snakeUnit, this.canvasContainer);
            Apple.initiCanvas(this.settings.columns * this.snakeUnit, this.settings.rows * this.snakeUnit, this.canvasContainer);

            /*this.canvas.width = this.settings.columns * this.snakeUnit;
            this.canvas.height = this.settings.rows * this.snakeUnit;
            this.appleCanvas.width = this.settings.columns * this.snakeUnit;
            this.appleCanvas.height = this.settings.rows * this.snakeUnit;*/

            this.createBoard();
            this.syncState(response.state);

            // MVP
            this.checkJoin();
        });

        socket.on('disconnect', () => {
            console.log('disconnected'); // TODO: handle disconnect
        });

        socket.on('sync-state', (state) => this.syncState(state));

        socket.on('sync-state-diff', (stateDiff) => this.syncStateDiff(stateDiff));

        socket.on('start-game', (state) => {
            console.log('The game is starting');
            this.createBoard();
            this.syncState(state);
        });

        socket.on('end-game', (state) => {
            console.log('The game is ending');
            this.syncState(state);
            this.endGame();
        });

        this.bindControlEventListeners();
    },

    bindControlEventListeners: function () {
        this.joinGameForm.addEventListener("submit", this.joinGame.bind(this));
        this.btnReadyCheck.addEventListener("click", this.readyCheck.bind(this));

        // TODO: ensure that non-players can't control the game
        document.addEventListener("keydown", (e) => {
            if (this.state.stateName !== GameState.STATE_NAME.PLAYING) return;

            Snake.control(e, this.state.snakes[this.socket.id], this.settings.columns, this.socket);
        });

        if (this.isTouchScreen) {
            ["up", "down", "left", "right"].forEach(direction => {
                const button = document.querySelector("." + direction);
                button.addEventListener("click", () => {
                    const event = new KeyboardEvent("keydown", { key: "Arrow" + direction.charAt(0).toUpperCase() + direction.slice(1) });
                    document.dispatchEvent(event);
                });
            });
        }
    },

    // TODO: This should be called when a user joins or leaves the game
    checkJoin: function () {
        const canJoin = (Object.keys(this.state.snakes).length < this.settings.players);
        this.joinGameForm.style.display = canJoin ? "inline-block" : "none";
        if (canJoin) {
            this.usernameInput.focus();
        }
    },

    joinGame: function (e) {
        e.preventDefault();

        if (!this.usernameInput.checkValidity()) {
            this.usernameInput.reportValidity();
            return;
        } 
        
        this.socket.emit('join-game', {
            username: this.usernameInput.value,
        });

        this.joinGameForm.style.display = "none";
        this.btnReadyCheck.style.display = "inline-block";
        this.btnReadyCheck.focus();
        
        if (this.isTouchScreen) {
            this.touchControlPanel.style.display = "block";
        }
    },

    readyCheck: function () {
        this.socket.emit('ready-check', true);

        this.btnReadyCheck.style.display = "none";
    },

    // TODO: There's a glitch regarding the snake tail rendering on the initial position
    createBoard: function () {
        /*this.board.innerHTML = "";
        this.board.style.width = this.settings.columns * this.snakeUnit;
        this.board.style.height = this.settings.rows * this.snakeUnit;*/
        this.canvasContainer.style.width = this.settings.columns * this.snakeUnit;
        this.canvasContainer.style.height = this.settings.rows * this.snakeUnit;

        this.joinGameForm.style.display = "none";
        this.btnReadyCheck.style.display = "none";

        /*for (let i = 0; i < this.settings.columns * this.settings.rows; i++) {
            let div = document.createElement("div");
            div.classList.add("grid");
            div.style.width = this.snakeUnit;
            div.style.height = this.snakeUnit;
            this.board.appendChild(div);
        }
        this.grid = document.querySelectorAll(".grid");*/
    },

    syncState: function (state) {
        console.log('syncing new state', state);
        this.state = new GameState(state);
        this.syncGame();
    },

    syncStateDiff: function (stateDiff) {
        console.log('syncing new state diff', stateDiff);
        this.state.mergeDiff(stateDiff);
        this.syncGame();
    },

    syncGame: function () {
        
        for (const [id, snakeState] of Object.entries(this.state.snakes)) {
            Snake.render(snakeState, id, this.settings.columns);
        };

        if (this.state.apple) {
            Apple.renderApple(this.state.apple, this.settings.columns);
        }

        this.refreshScore(false);
    },

    endGame: function () {
        if (this.state.snakes[this.socket.id]) {
            this.btnReadyCheck.style.display = "inline-block";
        } else {
            this.checkJoin();
        }

        this.refreshScore(true);
    },

    refreshScore: function (endGame = false) {
        let topScore = this.determineTopScore();
        this.scoreDisplay.innerHTML = "";

        Object.values(this.state.snakes).forEach((snake, index) => {
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
    },

    determineTopScore: function () {
        let scores = Object.values(this.state.snakes).map(snake => snake.currentScore);
        let topScore = Math.max(...scores);
        
        return topScore
    },

};
