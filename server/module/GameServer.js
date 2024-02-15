import { Snake } from './Snake.js';
import { Apple } from './Apple.js';

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

    initialize: function (io, settings) {
        this.io = io;

        // Listen for incoming socket.io connections
        this.io.on('connection', (socket) => this.connectUser(socket));

        this.updateSettings(settings);
    },

    connectUser: function (socket) {
        console.log('a user connected', socket.id);

        socket.emit('connected', {
            settings: this.settings,
            state: this.state,
        });

        // set up server event listeners
        socket.on('join-game', (preferences) => { // TODO: validate and sanitize options
            console.log('a player joined the game', socket.id, preferences);

            // return early if the game is already full
            if (Object.keys(this.state.snakes).length >= this.settings.players) return;

            // create a new snake for this user
            this.createSnake(socket, preferences);
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
            if (!this.state.snakes[socket.id]) return;

            console.log('a player is ready: ', socket.id);
            this.state.snakes[socket.id].readyCheck = !!msg;

            // start the game if all players are ready
            if (
                this.settings.players == Object.keys(this.state.snakes).length && 
                Object.values(this.state.snakes).every(snake => snake.readyCheck)
            ) {
                console.log('all players are ready, starting the game.');

                this.startGame(); // FIXME: provide data as necessary
            } else {
                this.syncState();
            }
        });

        socket.on('snake-control', (msg) => {
            if (!this.state.snakes[socket.id]) return;

            const snake = this.state.snakes[socket.id];

            if (!snake.canMove) return;

            snake.changeDirection(msg.direction, this.settings.columns);
        });
    },

    syncState: function () {
        this.io.emit('sync-state', this.state); // TODO: consider syncing only the changes
    },

    createSnake: function (socket, preferences) {
        this.state.snakes[socket.id] = Snake.createSnake({
            ...this.players[Object.keys(this.state.snakes).length], // TODO: calculate player initial position dynamically
            id: socket.id,
            username: preferences.username,
        });

        // broadcast the new game state to the clients
        this.syncState();
    },

    createVirtualGrid: function () {
        this.state.grid = Array.from({ length: this.settings.columns * this.settings.rows }, (_, i) => null);
    },

    updateSettings: function (settings) {
        this.settings.speedIncrement = parseFloat(settings.speedIncrement);
        this.settings.columns = parseInt(settings.columns);
        this.settings.rows = parseInt(settings.rows);
        this.settings.players = parseInt(settings.players);
        this.settings.endEarly = settings.endEarly ? true : false;

        //Snake.initialize(this.state.snakes, this.settings.columns);
    },

    startGame: function () {
        this.resetSnakes();
        this.createVirtualGrid();

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
        let chrashed = false;

        Object.values(this.state.snakes).forEach((snake, i) => {
            if (!snake.canMove) return;

            if (snake.checkForHits(this.state.grid, this.settings.columns, this.settings.rows)) {
                this.state.activePlayers--;
                chrashed = true;
            }
        });

        if (chrashed && (this.settings.endEarly || this.state.activePlayers < 1)) {
            this.endGame();

            return;
        }

        Object.values(this.state.snakes).forEach((snake, i) => {
            if (!snake.canMove) return;

            const headIndex = snake.move();
            this.state.grid[headIndex] = i;

            // If the tail left a field, set it to null
            let previousTailIndex = snake.previousPosition[snake.previousPosition.length - 1];
            if (previousTailIndex !== snake.currentPosition[snake.currentPosition.length - 1]) {
                this.state.grid[previousTailIndex] = null;
            }

            if (this.state.apple && headIndex === this.state.apple.position) {
                this.eatApple(snake);
            }
        });

        this.syncState();
    },

    endGame: function () {
        clearInterval(this.interval);

        this.state.stateName = 'waiting';
        this.state.apple = null;
        this.state.activePlayers = 0;

        console.log('game over');
        this.io.emit('end-game', this.state);
    },

    eatApple: function (snake) {
        snake.score(this.state.apple.value);

        if (this.state.apple.speedBomb) {
            this.increaseSpeed();
        }

        this.state.apple = Apple.createApple(this.state.grid);
    },

    increaseSpeed: function () {
        let newIntervalTime = Math.floor(this.state.intervalTime * this.settings.speedIncrement);

        if (newIntervalTime <= this.minInterval) return;

        clearInterval(this.interval);
        this.state.intervalTime = newIntervalTime;
        this.interval = setInterval(this.gameEventLoop.bind(this), this.state.intervalTime);
    },

    resetSnakes: function () {
        Object.values(this.state.snakes).forEach(snake => snake.reset());
    },
};
