import { io } from "socket.io-client";
import GameClient from '@app/Client/GameClient';

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(urlParams.entries());

    console.log('Initiating socket connection with query params:', queryParams);
    const socket = io('/', {
        query: queryParams,
    });

    const gameClient = new GameClient(socket);
    gameClient.initialize();
});
