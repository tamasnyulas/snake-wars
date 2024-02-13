# General TODOs:

- [ ] As the first step, a user should be able to create a game (handling multiple games is optional).
- [ ] A user should be able to set the game settings through a form.
- [ ] When a game is created, it should have a unique, sharable URL.
- [ ] The game should initialize based on the settings when it's created.
 
 # Client side TODOs:

- [ ] Show player names in the score table
- [ ] Show player ready state before the game starts
- [ ] Show the winner of the game
- [ ] Extract game settings and game control mechanics (join, ready) into a separate module
- [ ] Introduce game creation and game settings
 
 # Server side TODOs:

- [ ] ...

# Hosting TODOs:

- [ ] Ensure that deployment is fast, and if possible, doesn't always install all dependencies from scratch.
 
original: arn:aws:iam::533267311829:role/SnakeWarsCodeDeployRole

new: arn:aws:iam::533267311829:role/service-role/codebuild-snake-wars-service-role

https://eu-north-1.console.aws.amazon.com/codesuite/codebuild/projects/SnakeWarsBuildProject/edit/artifacts?region=eu-north-1
encription key: arn:aws:kms:eu-north-1:533267311829:alias/aws/s3