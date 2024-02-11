import { GameClient } from './module/GameClient.js';

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    const socket = io();

    GameClient.initialize(socket);

    //GameClient.startGame();
});
