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

app.set('view engine', 'ejs');
app.use(express.static(join(__rootdir, '/public')));
app.use(express.urlencoded({ extended: true }));

GameServer.initialize(io);

// Serve the game lobby page
app.get('/', (req, res) => {
    res.render('lobby', {
        games: GameServer.getGameList(),
        canCreateGame: GameServer.canCreateGame(),
    });
});

// Create a new game and redirect to the game's URL
app.post('/new-game', (req, res) => {
    if (!GameServer.canCreateGame()) {
        res.redirect('/');
        return;
    }

    try {
        const formData = req.body || {}; // Assuming form data is available in req.body
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
        res.render('game');
    } else {
        res.redirect('/');
    }
});

app.get('*', (req, res) => {
    res.redirect('/');
});

// Start the server
httpServer.listen(process.env.SERVER_PORT, () => {
    console.log('server running at http://localhost:' + process.env.SERVER_PORT);
});
