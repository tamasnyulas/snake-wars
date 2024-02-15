import { Snake } from './Snake.js';
import { Apple } from './Apple.js';

export const GameClient = {
    board: document.querySelector(".board"),
    popup: document.querySelector(".popup"),
    joinGameForm: document.querySelector(".joinGameForm"),
    usernameInput: document.querySelector("input[name='username']"),
    btnReadyCheck: document.querySelector(".readyCheck"),
    scoreDisplay: document.querySelector(".scoreDisplay"),
    touchControlPanel: document.querySelector(".touchControlPanel"),
    isTouchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
    grid: null,
    apple: null,
    socket: null,
    settings: null,
    state: null,
    snakeUnit: 20,

    initialize: function (socket) {
        this.socket = socket;

        // Set up client event listeners
        socket.on('connected', (response) => {
            console.log('connected', response);
            this.settings = response.settings;
            Snake.initialize(this.settings.columns);

            this.createBoard();
            this.syncState(response.state);
            this.syncGame();

            // MVP
            this.checkJoin();
        });

        socket.on('disconnect', () => {
            console.log('disconnected'); // TODO: handle disconnect
        });

        socket.on('sync-state', (state) => this.syncState(state));

        socket.on('start-game', (state) => {
            console.log('The game is starting');
            this.createBoard();
            this.syncState(state);
            this.syncGame();
        });

        socket.on('end-game', (state) => {
            console.log('The game is ending');
            this.syncState(state);
            this.syncGame();
            this.endGame();
        });

        this.bindControlEventListeners();
    },

    bindControlEventListeners: function () {
        this.joinGameForm.addEventListener("submit", this.joinGame.bind(this));
        this.btnReadyCheck.addEventListener("click", this.readyCheck.bind(this));

        // TODO: ensure that non-players can't control the game
        document.addEventListener("keydown", (e) => {
            if (this.state.stateName !== "playing") return;

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

    createBoard: function () {
        this.board.innerHTML = "";
        this.board.style.width = this.settings.columns * this.snakeUnit;
        this.board.style.height = this.settings.rows * this.snakeUnit;

        this.joinGameForm.style.display = "none";
        this.btnReadyCheck.style.display = "none";

        for (let i = 0; i < this.settings.columns * this.settings.rows; i++) {
            let div = document.createElement("div");
            div.classList.add("grid");
            div.style.width = this.snakeUnit;
            div.style.height = this.snakeUnit;
            this.board.appendChild(div);
        }
        this.grid = document.querySelectorAll(".grid");
    },

    syncState: function (state) {
        console.log('syncing new state', state);
        this.state = state; // TODO: consider checking differences and reacting to changes appropriately
        this.syncGame();
    },

    syncGame: function () {
        Object.values(this.state.snakes).forEach(snake => {
            Snake.render(snake, this.grid);
        });

        if (this.state.apple) {
            this.apple = Apple.renderApple(this.state.apple, this.grid);
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
            if (this.state.stateName === "waiting")  {
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
