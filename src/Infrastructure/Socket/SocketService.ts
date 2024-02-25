import { Server, Socket } from "socket.io";
import { Service, Inject } from "typedi";
import GameService from "@app/Service/GameService";
import PlayerService from "@app/Service/PlayerService";
import Game from "@domain/Entity/Game";

@Service()
export default class SocketService {
    private io!: Server;
    @Inject()
    private gameService!: GameService;
    @Inject()
    private playerService!: PlayerService;
    private initialized: boolean = false;

    setSocketServer(io: Server): void {
        this.io = io;
    }

    initConnectionListener(): void {
        if (this.initialized) return;

        this.io.on('connection', (socket) => this.onConnectUser(socket));
        this.initialized = true;
    }

    syncState(game: Game) {
        const response = {
            state: game.state,
            settings: game.settings,
            players: game.getPlayersMetadata(),
        };
        this.io.to(game.gameId).emit('sync-state', response);
    }

    emit(gameId: string, eventName: string, params: any) {
        this.io.to(gameId).emit(eventName, params);
    }

    private onConnectUser (socket: Socket): void {
        const gameId = socket.handshake.query.gameId?.toString() || '';

        if (!this.gameService.hasGame(gameId)) {
            socket.disconnect()
            return;
        }

        this.connectUser(socket, gameId);

        socket.on('disconnect', () => this.onDisconnectUser(socket, gameId));
    }

    private connectUser(socket: Socket, gameId: string): void {
        console.log('a new user is connecting to a game', socket.id, gameId);

        socket.join(gameId);

        // set up custom server event listeners
        socket.onAny((eventName: any, ...args: any[]) => {
            //console.log(gameId, 'Socket event:', eventName, 'Arguments:', ...args);

            switch (eventName) {
                case 'join-game':
                    this.onJoinGame(socket, gameId, args[0], args[1]);
                    break;
                case 'ready-check':
                    this.onReadyCheck(socket, gameId, args[0]);
                    break;
                case 'player-control':
                    this.onPlayerControl(socket, gameId, args[0]);
                    break;
            }
        });

        // TODO: get settings and state from GameService
        const game = this.gameService.getGame(gameId);
        socket.emit('connected', {
            state: game.state,
            settings: game.settings,
            players: game.getPlayersMetadata(),
        });
    }

    private onDisconnectUser(socket: Socket, gameId: string) {
        const game = this.gameService.onDisconnectUser(gameId, socket.id);

        console.log('user disconnected', socket.id);
        socket.removeAllListeners();

        if (game) {
            this.io.to(game.gameId).emit('end-game', game.state);
        }
    }

    private onJoinGame(socket: Socket, gameId: string, preferences: any, promise: Function) {
        const game = this.gameService.getGame(gameId);

        // return early if the game is already full
        if (game.isFull()) {
            return promise({
                isSuccess: false,
                error: 'The game is already full.',
            });
        }

        const player = this.playerService.createPlayer({
            id: socket.id,
            username: preferences.username,
            color: preferences.color || 'yellow', // TODO: get from user input
        });
        game.addPlayer(player);

        console.log('a player joined the game', gameId, socket.id, preferences);

        // broadcast the new game state to the clients
        this.syncState(game);

        return promise({
            isSuccess: true,
        });
    }

    private onReadyCheck(socket: Socket, gameId: string, isReady: any) {
        const game = this.gameService.getGame(gameId);

        if (!game.hasPlayer(socket.id)) return;

        game.getPlayer(socket.id).state.readyCheck = !!isReady; // TODO consider using a method (Player.setReadyCheck)

        // start the game if all players are ready
        if (game.canStart()) {
            console.log('all players are ready, starting the game.');

            game.startGame();

            this.io.to(game.gameId).emit('start-game', game.state);
        } else {
            this.syncState(game);
        }
    }

    private onPlayerControl(socket: Socket, gameId: string, msg: { direction: any; }) {
        const game = this.gameService.getGame(gameId);

        if (!game.hasPlayer(socket.id)) return;

        const player = game.getPlayer(socket.id);

        if (!player.state.canMove) return;

        player.changeDirection(msg.direction, game.settings.columns);
    }
}
