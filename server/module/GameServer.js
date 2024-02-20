import { GameRoom } from './GameRoom.js';

export const GameServer = {
    io: null,
    gameRooms: {},

    initialize: function (io) {
        this.io = io; // TODO: do I really need it here, or can I pass it for the rooms directly???

        // Listen for incoming socket.io connections (should happen only when joining a game room)
        this.io.on('connection', (socket) => this.onConnectUser(socket));
    },

    createGameId: function (formData) {
        const encodedData = Buffer.from(JSON.stringify(formData)).toString('base64');
        const encryptedData = Buffer.from(encodedData).toString('base64');
        const randomString = generateRandomString(8);

        // TODO: move this out of here
        function generateRandomString(length) {
            const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let randomString = '';
            for (let i = 0; i < length; i++) {
                randomString += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return randomString;
        }

        return randomString + encryptedData;
    }, 

    initializeGameRoom: function (gameId) {
        if (this.gameRooms[gameId]) {
            throw new Error('Game room already initialized.');
        }

        // Extract the encrypted data from the gameId
        const encryptedData = gameId.substring(8);
        const decryptedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
        const decodedData = Buffer.from(decryptedData, 'base64').toString('utf-8');
        const settings = JSON.parse(decodedData);

        this.gameRooms[gameId] = new GameRoom(this.io, gameId, settings);
    },

    visitGameRoom: function (gameId) {
        return !!this.gameRooms[gameId];
    }, 

    onConnectUser: function (socket) {
        const gameId = socket.handshake.query.gameId;

        if (!this.gameRooms[gameId]) {
            socket.disconnect()
            return;
        }

        this.gameRooms[gameId].connectUser(socket);

        socket.on('disconnect', () => this.onDisconnectUser(gameId));
    },

    onDisconnectUser: function (gameId) {
        console.log('a user is disconnected, checking for remaining users in the room');
        if (this.gameRooms[gameId] && this.gameRooms[gameId].getPlayerCount() < 1) { // TODO: check the connected user count instead of joined player count
            delete this.gameRooms[gameId];
            console.log('the game room is deleted');
        }
    }
};
