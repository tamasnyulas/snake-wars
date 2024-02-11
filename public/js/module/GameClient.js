import { Snake } from './Snake.js';
import { Apple } from './Apple.js';

export const GameClient = {
    board: document.querySelector(".board"),
    playAgain: document.querySelector(".playAgain"),
    scoreDisplay: document.querySelector(".scoreDisplay"),
    grid: null,
    //settingsForm: document.querySelector(".settingsForm"),

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

            this.syncState(response.state);
            this.createBoard();
            this.syncGame();

            // MVP
            if (Object.keys(this.state.snakes).length < this.settings.players) {
                // TODO: these events should be triggered manually by the user
                socket.emit('join-game', {name: socket.id}); // TODO: name should be set by the user
                socket.emit('ready-check', true);

                document.addEventListener("keydown", (e) => {
                    let snake = Array.from(this.snakes).find(snake => snake.id === socket.id);

                    Snake.control(e, snake, this.settings.columns, socket);
                });
            }
        });

        socket.on('sync-state', (state) => this.syncState(state));

        socket.on('start-game', (state) => {
            console.log('The game is starting');
            this.syncState(state);
            this.createBoard();
            this.syncGame();
        });

        socket.on('end-game', (state) => {
            console.log('The game is ending');
            this.syncState(state);
            this.endGame();
        });

        /*
        this.createSnakes();
        this.createBoard();

        document.addEventListener("keydown", function (e) {
            Snake.control(e, Game.snakes, Game.settings.columns);
        });

        this.playAgain.addEventListener("click", this.replay.bind(this));
        this.settingsForm.addEventListener("submit", this.updateSettings.bind(this));*/
    },

    /*createSnakes: function () {
        this.snakes = [];

        for (let i = 0; i< this.settings.players; i++) {
            this.snakes.push(Snake.createSnake(this.players[i]));
        }
    },*/

    createBoard: function () {
        this.board.innerHTML = "";
        this.board.style.width = this.settings.columns * this.snakeUnit;
        this.board.style.height = this.settings.rows * this.snakeUnit;

        this.playAgain.style.display = "none";
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
        this.state = state; // TODO: consider checking differences and reacting to changes appropriately
        console.log('state synced', this.state);
    },

    syncGame: function () {
        clearInterval(this.interval);

        this.snakes = [];
        Object.values(this.state.snakes).forEach(snakeState => {
            let snake = Snake.createSnake(snakeState);
            this.snakes.push(snake);
            Snake.render(snake, this.grid);
        });

        if (this.state.apple) {
            this.apple = Apple.renderApple(this.state.apple, this.grid);
        }

        if (this.state.stateName === "playing") {
            this.interval = setInterval(this.gameEventLoop.bind(this), this.state.intervalTime);
        }
    },

    gameEventLoop: function () {
        this.snakes.forEach(snake => {
            Snake.move(snake, this.grid);

            //if (this.grid[snake.currentPosition[0]].classList.contains("apple")) {
            //    this.eatApple(snake);
            //}
        });
    },

    endGame: function () {
        clearInterval(this.interval);

        //this.refreshScore(true);

        //this.playAgain.style.display = "flex";
        //this.playAgain.focus();
    },

    eatApple: function (snake) {
        this.grid[snake.currentPosition[0]].classList.remove("apple");
        snake.score(this.apple.value);
        this.refreshScore();

        if (this.apple.speedBomb) {
            this.increaseSpeed();
        }

        this.apple = Apple.createApple(this.grid);
    },





    startGame: function () {
        this.apple = Apple.createApple(this.grid);
        this.intervalTime = 200;
        this.activePlayers = this.snakes.length;
        
        this.snakes.forEach(snake => Snake.render(snake, this.grid));
        this.refreshScore();

        this.interval = setInterval(this.gameEventLoop.bind(this), this.intervalTime); // TODO: consider changing intervals to exist per snake
    },

    refreshScore: function (endGame = false) {
        let topScore = this.determineTopScore();
        this.scoreDisplay.innerHTML = "";

        this.snakes.forEach((snake, index) => {
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
        let scores = this.snakes.map(snake => snake.currentScore);
        let topScore = Math.max(...scores);
        
        return topScore
    },

    increaseSpeed: function () {
        let newIntervalTime = this.intervalTime * this.settings.speedIncrement;

        if (newIntervalTime <= this.minInterval) return;

        clearInterval(this.interval);
        this.intervalTime = newIntervalTime;
        this.interval = setInterval(this.gameEventLoop.bind(this), this.intervalTime);
    },

    replay: function () {
        this.board.innerHTML = "";
        this.endGame();
        this.resetSnakes();
        this.createBoard();
        this.startGame();
        this.playAgain.style.display = "none";
    },

    resetSnakes: function () {
        this.snakes.forEach(snake => snake.reset());
    },
};