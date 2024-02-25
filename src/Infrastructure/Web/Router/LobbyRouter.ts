import { Container } from 'typedi';
import express from 'express';
import GameService from '@app/Service/GameService';

const LobbyRouter = express.Router();
const service = Container.get(GameService) as GameService;

LobbyRouter.get('/', (req, res) => {
    res.render('lobby', {
        games: service.getGameList(),
        canCreateGame: service.canCreateGame(),
    });
});

export default LobbyRouter;
