import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { GameServer } from './module/GameServer.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Set "public" directory as the root for public resources
app.use(express.static(join(__dirname, '../public')));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

GameServer.initialize(io);

// Start the server
httpServer.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});