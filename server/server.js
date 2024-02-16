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

    // Encode and encrypt the form data
    const encodedData = Buffer.from(JSON.stringify(formData)).toString('base64');
    const encryptedData = Buffer.from(encodedData).toString('base64');

    // Generate a random string for uniqueness
    const randomString = generateRandomString(8);

    // Combine the random string and the encrypted data as the gameId
    const gameId = randomString + encryptedData;

    res.redirect('/play/' + gameId);
});

// GameServer initialization when a certain game's URL is requested
app.get('/play/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const io = new Server(httpServer);

    // Extract the encrypted data from the gameId
    const encryptedData = gameId.substring(8);

    // Decrypt and decode the data
    try {    
        const decryptedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
        const decodedData = Buffer.from(decryptedData, 'base64').toString('utf-8');
        const formData = JSON.parse(decodedData);

        GameServer.initialize(io, formData);

        res.sendFile(join(__rootdir, 'public/game.html'));
    } catch (error) {
        // TODO: send some error message to the client
        console.error('Error:', error);
        res.redirect('/');
    }
});

// Start the server
httpServer.listen(process.env.SERVER_PORT, () => {
    console.log('server running at http://localhost:' + process.env.SERVER_PORT);
});

// TODO: move this function
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}
