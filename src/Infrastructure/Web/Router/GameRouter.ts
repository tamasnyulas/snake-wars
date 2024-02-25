import { Container } from 'typedi';
import express from 'express';
import GameService from '@app/Service/GameService';
import SocketService from '@infra/Socket/SocketService';

const GameRouter = express.Router();
const gameService = Container.get(GameService) as GameService;

// Create a new game and redirect to the game's URL
GameRouter.post('/', (req, res) => {
    if (!gameService.canCreateGame()) {
        res.redirect('/');
        return;
    }

    try {
        const settings = gameService.parseGameSettings(req.body);
        const gameId = gameService.createGame(settings, (gameId, eventName, parameter) => {
            Container.get(SocketService).emit(gameId, eventName, parameter);
        });

        res.redirect('/game/play?gameId=' + gameId);
    } catch (error) {
        console.error('Error creating game:', error);

        res.redirect('/');
    }
});

GameRouter.get('/play', (req, res) => {
    const gameId = req.query.gameId?.toString() || '';
    const socketService = Container.get(SocketService) as SocketService;

    if (gameService.hasGame(gameId)) {
        socketService.initConnectionListener();
        
        res.render('game');
    } else {
        res.redirect('/');
    }
});

export default GameRouter;