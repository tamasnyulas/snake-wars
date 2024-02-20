import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { GameServer } from './module/GameServer.js';

dotenv.config();
const app = express();
const httpServer = createServer(app);
const __rootdir = path.resolve(dirname(fileURLToPath(import.meta.url)), '..');
const io = new Server(httpServer);

GameServer.initialize(io);

// Set "public" directory as the root for public resources
app.use(express.static(join(__rootdir, '/public'))); // TODO: this doesn't seem to work when it comes to html file references
app.use(express.urlencoded({ extended: true }));

// Serve the game lobby page
app.get('/', (req, res) => {
    res.sendFile(join(__rootdir, '/public/lobby.html'));
});

// Create a new game and redirect to the game's URL
app.post('/new-game', (req, res) => {
    const formData = req.body || {}; // Assuming form data is available in req.body

    try {
        const gameId = GameServer.createGameId(formData);
        GameServer.initializeGameRoom(gameId);
        res.redirect('/play?gameId=' + gameId);
    } catch (error) {
        // TODO: send some error message to the client
        console.error('Error:', error);
        res.redirect('/');
    }
});

// GameServer initialization when a certain game's URL is requested
app.get('/play', (req, res) => {
    const gameId = req.query.gameId;

    if (GameServer.visitGameRoom(gameId)) {
        res.sendFile(join(__rootdir, 'public/game.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/api/list-games', (req, res) => {
    let games = [];
    for (const gameId in GameServer.gameRooms) {
        const gameRoom = GameServer.gameRooms[gameId];
        // TODO: add name name and additional info if needed.
        games.push({
            link: '/play?gameId=' + gameId,
            settings: gameRoom.settings,
            players: gameRoom.getPlayerCount(),
        });
    }

    res.json(games);
});

// Start the server
httpServer.listen(process.env.SERVER_PORT, () => {
    console.log('server running at http://localhost:' + process.env.SERVER_PORT);
});
