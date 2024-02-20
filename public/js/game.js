import { GameClient } from './module/GameClient.js';

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(urlParams.entries());

    const socket = io('/', {
        query: queryParams,
    });

    GameClient.initialize(socket);
});
