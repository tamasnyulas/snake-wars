require('module-alias/register');
import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import Container from 'typedi';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import LobbyRouter from './Router/LobbyRouter';
import GameRouter from './Router/GameRouter';
import SocketService from '@infra/Socket/SocketService';

dotenv.config();
const app = express();
const httpServer = createServer(app);
const __rootdir = path.resolve(dirname(__filename), '../../..');

app.set('view engine', 'ejs');
app.set('views', join(__rootdir, 'src/Application/Client/Presentation/Views'));
app.use(express.static(join(__rootdir, '/public')));
app.use(express.urlencoded({ extended: true }));

const socketService = Container.get(SocketService) as SocketService;
socketService.setSocketServer(new Server(httpServer));

// Routers
app.use('/', LobbyRouter);
app.use('/game', GameRouter);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack); // TODO: ensure that the error is properly logged

    if (process.env.NODE_ENV === 'development') {
        res.type('text').status(500).send(err.stack);
    } else {
        res.type('text').status(500).send('Internal Server Error');
    }
});

// Fallback route for invalid URLs
app.get('*', (req, res) => {
    res.redirect('/');
});

// Start the server
httpServer.listen(process.env.SERVER_PORT, () => {
    console.log('server running at http://localhost:' + process.env.SERVER_PORT);
});