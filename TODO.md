# General TODOs:

- [x] As the first step, a user should be able to create a game (handling multiple games is optional).
- [x] A user should be able to set the game settings through a form.
- [x] When a game is created, it should have a unique, sharable URL.
- [x] The game should initialize based on the settings when it's created.
- [ ] Handle different log levels for development and production.
- [ ] Refactor and clean up the code based on best practices.
- [x] List the available games on the lobby page.
- [x] Sync data should only contain what changed, instead of pushing everything.
- [ ] Fix quick turning issues, so it doesn't feel like a missed action.
- [ ] Provide color selection before joining the game.
- [ ] Introduce special apple effects (e.g. ethernal, bullet time, mass slow, mass haste, etc.).
- [ ] Introduce game modes (e.g. Death match, Team death match, Capture the flag, etc.).
- [ ] Provide description on the game creation UI, to understand apple effects, apple values and game modes.
 
 # Client side TODOs:

- [x] Make the game mobile friendly.
- [x] Show player names in the score table.
- [x] Show player ready state before the game starts.
- [x] Show the winner of the game.
- [ ] Extract game settings and game control mechanics (join, ready) into a separate module.
- [x] Introduce game creation and game settings.
- [ ] Smooth out snake movement.
- [ ] Make the UI nicer.
- [ ] Add loading indicator to handle laggy actions.
- [ ] Fix rendering of the initial snake tail.
- [ ] Fix failing websocket connections before joining a game.
- [ ] Optimize score display rendering.
 
 # Server side TODOs:

- [ ] Add validation for the submitted game settings.
- [ ] User session ID instead of socket id (because it's generated on every connect, disconnect, page reload, etc.)
- [ ] Calculate initial snake positions dynamically.
- [ ] Manage multiple games based on the unique game ID.
- [x] An iteration should first calculate crashes for all snakes, and only after that move them (in two separate loops).
- [ ] Ensure that `GameServer.gameEventLoop()` works highly efficiently with top performance.
- [ ] Consider validating and sanitizing user settings (name, color) when a user joins the game.

# Hosting TODOs:

- [x] Ensure that deployment is fast, and if possible, doesn't always install all dependencies from scratch.
- [x] Consider using CodePipeline v1 for unlimited free deployments.
 