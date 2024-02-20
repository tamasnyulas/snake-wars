import { Snake } from './Snake.js';
import { Apple } from './Apple.js';
import { ServerGameState } from './ServerGameState.js';

export class GameRoom {
    io = null;
    gameId = null;
    state = new ServerGameState();
    settings = {
        speedIncrement: 0.8,
        columns: 20,
        rows: 20,
        players: 1,
        endEarly: true,
    };
    interval = null;
    minInterval = 50;
    players = [
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
    ];

    constructor(io, gameId, settings) {
        this.io = io;
        this.gameId = gameId;
        this.settings = settings;

        this.updateSettings(settings);
    }

    updateSettings(settings) {
        this.settings.speedIncrement = parseFloat(settings.speedIncrement);
        this.settings.columns = parseInt(settings.columns);
        this.settings.rows = parseInt(settings.rows);
        this.settings.players = parseInt(settings.players);
        this.settings.endEarly = settings.endEarly ? true : false;
    }

    connectUser(socket) {
        console.log('a new user is connecting to a game room', socket.id, this.gameId);

        socket.join(this.gameId);

        // set up server event listeners
        socket.onAny((eventName, ...args) => {
            //console.log('Socket event:', eventName, 'Arguments:', ...args);

            switch (eventName) {
                case 'join-game':
                    this.onJoinGame(socket, ...args);
                    break;
                case 'disconnect':
                    this.onDisconnectUser(socket, ...args);
                    break;
                case 'ready-check':
                    this.onReadyCheck(socket, ...args);
                    break;
                case 'snake-control':
                    this.onSnakeControl(socket, ...args);
                    break;
            }
        });

        socket.emit('connected', {
            settings: this.settings,
            state: this.state,
        });
    }

    onJoinGame(socket, preferences, callback) {
        // return early if the game is already full
        if (Object.keys(this.state.snakes).length >= this.settings.players) {
            //callback(false);
            return callback({
                isSuccess: false,
                error: 'The game is already full.',
            });
        }

        // TODO: validate and sanitize options

        console.log('a player joined the game', socket.id, preferences);

        // create a new snake for this user
        this.createSnake(socket, preferences);

        return callback({
            isSuccess: true,
        });
    }

    onDisconnectUser(socket) {
        // return early if the user is not a player
        if (this.state.snakes[socket.id]) {
            // remove the player from the game
            delete this.state.snakes[socket.id];
            console.log('a player left the game, waiting for new players.');

            this.endGame();
        }

        console.log('user disconnected', socket.id);
        socket.removeAllListeners();
    }

    onReadyCheck(socket, isReady) {
        if (!this.state.snakes[socket.id]) return;

        console.log('a player is ready: ', socket.id);
        this.state.snakes[socket.id].readyCheck = !!isReady;

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
    }

    onSnakeControl(socket, msg) {
        if (!this.state.snakes[socket.id]) return;

        const snake = this.state.snakes[socket.id];

        if (!snake.canMove) return;

        snake.changeDirection(msg.direction, this.settings.columns);
    }

    syncState() {
        this.io.to(this.gameId).emit('sync-state', this.state);
    }

    syncStateDiff() {
        this.io.to(this.gameId).emit('sync-state-diff', this.state.purgeDiff());
    }

    createSnake(socket, preferences) {
        this.state.snakes[socket.id] = Snake.createSnake({
            ...this.players[Object.keys(this.state.snakes).length], // TODO: calculate player initial position dynamically
            id: socket.id,
            username: preferences.username,
        });

        // broadcast the new game state to the clients
        this.syncState();
    }

    createVirtualGrid() {
        this.state.grid = Array.from({ length: this.settings.columns * this.settings.rows }, (_, i) => 0);
    }

    startGame() {
        this.resetSnakes();
        this.createVirtualGrid();

        this.state.stateName = ServerGameState.STATE_NAME.PLAYING;

        Object.values(this.state.snakes).forEach((snake, i) => {
            snake.initialPosition.forEach(position => {
                this.state.grid[position] = i;
            });
        });

        this.state.apple = Apple.createApple(this.state.grid);
        this.state.intervalTime = 200;
        this.state.activePlayers = Object.keys(this.state.snakes).length;

        this.io.to(this.gameId).emit('start-game', this.state);

        this.interval = setInterval(this.gameEventLoop.bind(this), this.state.intervalTime);
    }

    gameEventLoop() {
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

        Object.values(this.state.snakes).forEach((snake) => {
            if (!snake.canMove) return;

            const headIndex = snake.move();
            this.state.grid[headIndex] = 1;

            let previousTailIndex = snake.previousPosition[snake.previousPosition.length - 1];
            if (previousTailIndex !== snake.currentPosition[snake.currentPosition.length - 1]) {
                this.state.grid[previousTailIndex] = 0;
            }

            if (this.state.apple && headIndex === this.state.apple.position) {
                this.eatApple(snake);
            }
        });

        this.syncStateDiff();
    }

    endGame() {
        console.log('game over');
        clearInterval(this.interval);

        this.state.reset();

        this.io.to(this.gameId).emit('end-game', this.state);
    }

    eatApple(snake) {
        snake.score(this.state.apple.value);

        if (this.state.apple.speedBomb) {
            this.increaseSpeed();
        }

        this.state.apple = Apple.createApple(this.state.grid);
    }

    increaseSpeed() {
        let newIntervalTime = Math.floor(this.state.intervalTime * this.settings.speedIncrement);

        if (newIntervalTime <= this.minInterval) return;

        clearInterval(this.interval);
        this.state.intervalTime = newIntervalTime;
        this.interval = setInterval(this.gameEventLoop.bind(this), this.state.intervalTime);
    }

    resetSnakes() {
        Object.values(this.state.snakes).forEach(snake => snake.reset());
    }

    getPlayerCount() {
        return Object.keys(this.state.snakes).length;
    }
}
