import { Game } from './game.js';
import { Snake } from './snake.js';

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("keydown", function (e) {
        Snake.control(e, Game.snake, Game.columns); // TODO: move this to Snake
    });
    Game.addSnake([2, 1, 0], 1);
    Game.createBoard();
    Game.startGame();
    Game.playAgain.addEventListener("click", Game.replay.bind(Game));
});
