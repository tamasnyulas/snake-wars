import { Container } from 'typedi';
import express from 'express';
import GameServerService from '@app/Service/GameServerService'; 

const GameRouter = express.Router();

// Create a new game and redirect to the game's URL
GameRouter.post('/', (req, res) => {
    const service = Container.get(GameServerService) as GameServerService;

    if (!service.canCreateGame()) {
        res.redirect('/');
        return;
    }

    try {
        const formData = req.body || {}; // Assuming form data is available in req.body
        const gameId = service.createGameId(formData);
        service.initializeGameRoom(gameId);
        res.redirect('/game/play?gameId=' + gameId);
    } catch (error) {
        // TODO: send some error message to the client
        console.error('Error:', error);
        res.redirect('/');
    }
});

// GameServerService initialization when a certain game's URL is requested
GameRouter.get('/play', (req, res) => {
    const service = Container.get(GameServerService) as GameServerService;
    const gameId = req.query.gameId?.toString() || '';

    if (service.visitGameRoom(gameId)) {
        res.render('game');
    } else {
        res.redirect('/');
    }
});

export default GameRouter;