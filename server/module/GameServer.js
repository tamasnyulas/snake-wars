import { Snake } from './Snake.js';
import { Apple } from './Apple.js';

/*
 * TODO: 
 * - As the first step, a user should be able to create a game (handling multiple games is optional).
 * - A user should be able to set the game settings through a form.
 * - When a game is created, it should have a unique, sharable URL.
 * - The game should initialize based on the settings when it's created.
 */

export const GameServer = {
    io: null,
    state: {
        stateName: 'waiting',
        grid: null,
        intervalTime: 0,
        activePlayers: 0,
        snakes: {},
        apple: null,
    },
    settings: {
        speedIncrement: 0.8,
        columns: 20,
        rows: 20,
        players: 1,
        endEarly: true,
    },
    interval: null,
    minInterval: 50,
    // TODO: remove players after MVP
    players: [
        { // player 1
            initialPosition: [17, 18, 19], // TODO: calculate initial position based on rows and columns
            initialDirection: -1,
        },
        { // player 2
            initialPosition: [2, 1, 0],
            initialDirection: 1,
        },
        { // player 3
            initialPosition: [(19*20)+2, (19*20)+1, (19*20)+0], // TODO: calculate initial position based on rows and columns
            initialDirection: 1,
        },
    ],

    initialize: function (io) {
        this.io = io;

        // Listen for incoming socket.io connections
        this.io.on('connection', (socket) => this.connectUser(socket));

        this.updateSettings();
        this.createVirtualGrid();
    },

    connectUser: function (socket) {
        console.log('a user connected', socket.id);

        socket.emit('connected', {
            settings: this.settings,
            state: this.state,
        });

        // set up server event listeners
        socket.on('join-game', (msg) => { // TODO: get player name from msg
            console.log('a player joined the game', socket.id);

            // return early if the game is already full
            if (Object.keys(this.state.snakes).length >= this.settings.players) return;

            // create a new snake for this user
            this.createSnake(socket);
        });

        socket.on('disconnect', () => {
            // return early if the user is not a player
            if (this.state.snakes[socket.id]) {
                // remove the player from the game
                delete this.state.snakes[socket.id];
                console.log('a player left the game, waiting for new players.');

                this.endGame();
            }

            console.log('user disconnected', socket.id);
            socket.removeAllListeners();
        });

        socket.on('ready-check', (msg) => {
            console.log('a player is ready: ', socket.id);
            this.state.snakes[socket.id].readyCheck = !!msg;

            // start the game if all players are ready
            if (
                this.settings.players == Object.keys(this.state.snakes).length && 
                Object.values(this.state.snakes).every(snake => snake.readyCheck)
            ) {
                console.log('all players are ready, starting the game.');

                this.startGame(); // FIXME: provide data as necessary
            }
        });

        socket.on('snake-control', (msg) => {
            if (!this.state.snakes[socket.id].canMove) return;

            Snake.changeDirection(this.state.snakes[socket.id], msg.direction, this.settings.columns);

            // broadcast the new game state to the clients
            this.io.emit('sync-state', this.state); // TODO: consider implementing a lighter solution to avoid broadcasting the entire game state
        });
    },

    createSnake: function (socket) {
        this.state.snakes[socket.id] = Snake.createSnake({
            ...this.players[Object.keys(this.state.snakes).length], // TODO: calculate player initial position dynamically
            id: socket.id,
        });

        // broadcast the new game state to the clients
        this.io.emit('sync-state', this.state);
    },

    createVirtualGrid: function () {
        this.state.grid = Array.from({ length: this.settings.columns * this.settings.rows }, (_, i) => null);
    },

    updateSettings: function () {
        // TODO: get settings from the game creation parameters

        /*this.settings.speedIncrement = parseFloat(this.settingsForm.speedIncrement.value);
        this.settings.columns = parseInt(this.settingsForm.columns.value);
        this.settings.rows = parseInt(this.settingsForm.rows.value);
        this.settings.players = parseInt(this.settingsForm.players.value);
        this.settings.endEarly = this.settingsForm.endEarly.checked;*/

        //Snake.initialize(this.state.snakes, this.settings.columns);
    },

    startGame: function () {
        this.state.stateName = 'playing';

        Object.values(this.state.snakes).forEach((snake, i) => {
            snake.initialPosition.forEach(position => {
                this.state.grid[position] = i;
            });
        });

        this.state.apple = Apple.createApple(this.state.grid);
        this.state.intervalTime = 200;
        this.state.activePlayers = Object.keys(this.state.snakes).length;

        this.io.emit('start-game', this.state);

        this.interval = setInterval(this.gameEventLoop.bind(this), this.state.intervalTime);
    },

    gameEventLoop: function () {
        Object.values(this.state.snakes).forEach(snake => {
            if (Snake.checkForHits(snake, this.state.grid, this.settings.columns, this.settings.rows)) { // TODO: consider moving checkForHits to Snake.move and make Snake.move object-oriented
                snake.canMove = false; 

                // check end game condition
                if (this.settings.endEarly || --this.state.activePlayers < 1) {
                    this.endGame();
                    return;    
                }
            }

            Snake.move(snake);

            //if (this.state.grid[snake.currentPosition[0]].classList.contains("apple")) {
            //    this.eatApple(snake);
            //}
        });
    },

    endGame: function () {
        clearInterval(this.interval);

        this.state.stateName = 'waiting';
        this.state.apple = null;
        this.resetSnakes();

        this.io.emit('end-game', this.state);
    },

    eatApple: function (snake) {
        this.state.grid[snake.currentPosition[0]].classList.remove("apple");
        snake.score(this.state.apple.value);
        this.refreshScore();

        if (this.state.apple.speedBomb) {
            this.increaseSpeed();
        }

        this.state.apple = Apple.createApple(this.state.grid);
    },

    /*refreshScore: function (endGame = false) {
        let topScore = this.determineTopScore();
        this.scoreDisplay.innerHTML = "";

        this.state.snakes.forEach((snake, index) => {
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
        let scores = this.state.snakes.map(snake => snake.currentScore);
        let topScore = Math.max(...scores);
        
        return topScore
    },*/

    increaseSpeed: function () {
        let newIntervalTime = this.state.intervalTime * this.settings.speedIncrement;

        if (newIntervalTime <= this.minInterval) return;

        clearInterval(this.interval);
        this.state.intervalTime = newIntervalTime;
        this.interval = setInterval(this.gameEventLoop.bind(this), this.state.intervalTime);
    },

    /*replay: function () {
        this.board.innerHTML = "";
        this.endGame();
        this.resetSnakes();
        this.createBoard();
        this.startGame();
        this.playAgain.style.display = "none";
    },*/

    resetSnakes: function () {
        Object.values(this.state.snakes).forEach(snake => snake.reset());
    },
};
