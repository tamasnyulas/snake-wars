/**
 * TODO:
 * - Responsible for orchestrating users and game rooms.
 */
import { Service } from 'typedi';
import { Server, Socket } from 'socket.io';
import GameRoomService from './GameRoomService';

export default class GameServerService {
    protected io: Server;
    protected gameRooms: { [gameId: string]: GameRoomService } = {};
    protected maxGameRooms: number = parseInt(process.env.MAX_GAME_ROOM || '10');

    // TODO: replace io with an interface and keep it out from the application and domain layers
    constructor (io: Server) {
        this.io = io;
        
        // Listen for incoming socket.io connections (should happen only when joining a game room)
        this.io.on('connection', this.onConnectUser.bind(this));
    }

    createGameId (formData: object): string {
        const encodedData = Buffer.from(JSON.stringify(formData)).toString('base64');
        const encryptedData = Buffer.from(encodedData).toString('base64');
        const randomString = generateRandomString(8);

        // TODO: move this out of here
        function generateRandomString(length: number) {
            const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let randomString = '';
            for (let i = 0; i < length; i++) {
                randomString += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return randomString;
        }

        return randomString + encryptedData;
    }

    initializeGameRoom (gameId: string): void {
        if (this.gameRooms[gameId]) {
            throw new Error('Game room already initialized.');
        }

        // Extract the encrypted data from the gameId
        const encryptedData = gameId.substring(8);
        const decryptedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
        const decodedData = Buffer.from(decryptedData, 'base64').toString('utf-8');
        const settings = JSON.parse(decodedData);

        this.gameRooms[gameId] = new GameRoomService(this.io, gameId, settings);
    }

    visitGameRoom (gameId: string): boolean {
        return !!this.gameRooms[gameId];
    }

    onConnectUser (socket: Socket): void {
        const gameId = socket.handshake.query.gameId?.toString() || '';

        if (!this.gameRooms[gameId]) {
            socket.disconnect()
            return;
        }

        this.gameRooms[gameId].connectUser(socket);

        socket.on('disconnect', () => this.onDisconnectUser(gameId));
    }

    onDisconnectUser (gameId: string) {
        console.log('a user is disconnected, checking for remaining users in the room');
        if (this.gameRooms[gameId] && this.gameRooms[gameId].getPlayerCount() < 1) { // TODO: check the connected user count instead of joined player count
            delete this.gameRooms[gameId];
            console.log('the game room is deleted');
        }
    }

    getGameList (): object[] { // TODO: define GameList type (or similar)
        let games = [];
        
        for (const gameId in this.gameRooms) {
            const gameRoom = this.gameRooms[gameId];
            // TODO: add name name and additional info if needed.
            games.push({
                link: '/game/play?gameId=' + gameId,
                settings: gameRoom.settings,
                players: gameRoom.getPlayerCount(),
            });
        }

        return games;
    }

    canCreateGame (): boolean {
        return Object.keys(this.gameRooms).length < this.maxGameRooms;
    }
};