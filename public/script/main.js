import { Game } from './game.js';

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    Game.initialize();
    Game.addSnake([2, 1, 0], 1);
    Game.startGame();
});
