import { Snake } from './Snake.js';
import { Apple } from './Apple.js';

/**
 * TODO:
 * - Show player names in the score table
 * - Show player ready state before the game starts
 * - Show the winner of the game
 * - Extract game settings and game control mechanics (join, ready) into a separate module
 * - Introduce game creation and game settings
 */

export const GameClient = {
    board: document.querySelector(".board"),
    popup: document.querySelector(".popup"),
    btnJoinGame: document.querySelector(".joinGame"),
    btnReadyCheck: document.querySelector(".readyCheck"),
    scoreDisplay: document.querySelector(".scoreDisplay"),
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

        this.btnJoinGame.addEventListener("click", this.joinGame.bind(this));
        this.btnReadyCheck.addEventListener("click", this.readyCheck.bind(this));
    },

    // TODO: This should be called when a user joins or leaves the game
    checkJoin: function () {
        this.btnJoinGame.style.display = (Object.keys(this.state.snakes).length < this.settings.players) ? "inline-block" : "none";
    },

    joinGame: function () {
        this.socket.emit('join-game', {name: this.socket.id});

        this.btnJoinGame.style.display = "none";
        this.btnReadyCheck.style.display = "inline-block";
    },

    readyCheck: function () {
        this.socket.emit('ready-check', true);

        this.btnReadyCheck.style.display = "none";

        document.addEventListener("keydown", (e) => {
            Snake.control(e, this.state.snakes[this.socket.id], this.settings.columns, this.socket);
        });
    },

    createBoard: function () {
        this.board.innerHTML = "";
        this.board.style.width = this.settings.columns * this.snakeUnit;
        this.board.style.height = this.settings.rows * this.snakeUnit;

        this.btnJoinGame.style.display = "none";
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
        console.log('syncing state', this.state, 'into', state);
        this.state = state; // TODO: consider checking differences and reacting to changes appropriately
        this.syncGame();
    },

    syncGame: function () {
        console.log('syncing game');

        document.querySelectorAll('.grid').forEach(element => element.classList.remove('snake'));

        Object.values(this.state.snakes).forEach(snake => {
            Snake.render(snake, this.grid);
        });

        if (this.state.apple) {
            this.apple = Apple.renderApple(this.state.apple, this.grid);
        }

    },

    endGame: function () {
        document.removeEventListener("keydown", {});

        if (this.state.snakes[this.socket.id]) {
            this.btnReadyCheck.style.display = "inline-block";
        } else {
            this.checkJoin();
        }

        //this.refreshScore(true);

        //this.playAgain.style.display = "flex";
        //this.playAgain.focus();
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

            row.innerHTML = `<th>Snake ${index + 1}</th><td>${snake.currentScore}</td>`;
            this.scoreDisplay.appendChild(row);
        });
    },

    determineTopScore: function () {
        let scores = Object.values(this.state.snakes).map(snake => snake.currentScore);
        let topScore = Math.max(...scores);
        
        return topScore
    },

};
