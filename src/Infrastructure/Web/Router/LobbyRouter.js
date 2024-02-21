import express from 'express';
import GameServerService from '../../../Application/Service/GameServerService.js'; 

const LobbyRouter = express.Router();

LobbyRouter.get('/', (req, res) => {
    res.render('lobby', {
        games: GameServerService.getGameList(),
        canCreateGame: GameServerService.canCreateGame(),
    });
});

export default LobbyRouter;
