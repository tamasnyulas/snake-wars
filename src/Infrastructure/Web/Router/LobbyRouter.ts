import { Container } from 'typedi';
import express from 'express';
import GameServerService from '@app/Service/GameServerService';

const LobbyRouter = express.Router();

LobbyRouter.get('/', (req, res) => {
    const service = Container.get(GameServerService) as GameServerService;

    res.render('lobby', {
        games: service.getGameList(),
        canCreateGame: service.canCreateGame(),
    });
});

export default LobbyRouter;
