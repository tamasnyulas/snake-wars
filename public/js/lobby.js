// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    // get list of games from /api/list-games URL
    fetch('/api/list-games')
        .then(response => response.json())
        .then(data => {
            const gameList = document.querySelector('.gameList');
            gameList.innerHTML = '';

            if (data.length === 0) {
                gameList.innerHTML = 'No games available';
                return;
            }

            data.forEach(game => {
                const gameLink = document.createElement('a');
                gameLink.href = game.link;
                gameLink.innerText = `Game: ${game.settings.columns}x${game.settings.rows}, ${game.players}/${game.settings.players} players`;
                gameList.appendChild(gameLink);
                gameList.appendChild(document.createElement('br'));
            });
        });
});
