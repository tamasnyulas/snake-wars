import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import LobbyRouter from './Router/LobbyRouter.js';
import GameRouter from './Router/GameRouter.js';
import GameServerService from '../../Application/Service/GameServerService.js'; 

dotenv.config();
const app = express();
const httpServer = createServer(app);
const __rootdir = path.resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

app.set('view engine', 'ejs');
app.set('views', join(__rootdir, 'src/Application/Client/Presentation/Views'));
app.use(express.static(join(__rootdir, '/public')));
app.use(express.urlencoded({ extended: true }));

// TODO: move this out of here
const io = new Server(httpServer);
GameServerService.initialize(io);

// Routers
app.use('/', (req, res, next) => {
    // pass io to the LobbyRouter
    req.io = io;
    LobbyRouter(req, res, next);
});
app.use('/game', GameRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // TODO: ensure that the error is properly logged
    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack); // TODO: ensure that the error is properly logged

        if (process.env.NODE_ENV === 'development') {
            res.status(500).send(err.stack); // TODO: fix this, as the client seems to be pending forever
        } else {
            res.status(500).send('Internal Server Error');
        }
    });
});

// Fallback route for invalid URLs
app.get('*', (req, res) => {
    res.redirect('/');
});

// Start the server
httpServer.listen(process.env.SERVER_PORT, () => {
    console.log('server running at http://localhost:' + process.env.SERVER_PORT);
});