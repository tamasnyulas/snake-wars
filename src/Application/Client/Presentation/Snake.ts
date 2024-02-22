import { Socket } from "socket.io-client";

export default class Snake {
    protected static directionMap: any;
    protected static controlKeys: any = {
        left: 'ArrowLeft',
        up: 'ArrowUp',
        right: 'ArrowRight',
        down: 'ArrowDown',
    };
    protected static canvases: any = {};
    protected static canvasWidth: number;
    protected static canvasHeight: number;
    protected static canvasContainer: any;

    static initialize (columns: number, width: number, height: number, canvasContainer: any) {
        this.directionMap = {
            "1": "east",
            '-1': "west",
            [columns]: "south",
            ["-" + columns]: "north",
        };
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.canvasContainer = canvasContainer;
    }

    protected static getCanvas (id: string) {
        if (this.canvases[id]) return this.canvases[id];

        this.canvases[id] = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvases[id]);
        this.canvases[id].width = this.canvasWidth;
        this.canvases[id].height = this.canvasHeight;

        return this.canvases[id];
    }

    createSnake (options: any) {
        const snakeInstance = {
            ...options,
            currentPosition: [...options.initialPosition],
            currentDirection: options.initialDirection,
            size: options.initialPosition.size,
            currentScore: 0,
            growth: 0,
            canMove: true,
            username: options.username,
            color: options.color,
            reset: function () {
                this.currentPosition = [...this.initialPosition];
                this.currentDirection = this.initialDirection;
                this.size = this.initialPosition.size;
                this.growth = 0;
                this.currentScore = 0;
                this.canMove = true;
            },
            score: function (value: number) {
                this.growth += value;
                this.currentScore += value;
            },
        };

        return snakeInstance;
    }

    // TODO: when the game is over, the snakes are still animated for their last moves on state synchronization. This should be fixed.
    static render (snakeState: any, id: string, gridSize: number) {
        if (!snakeState.canMove) return;

        const canvasContext = this.getCanvas(id).getContext('2d');

        let frame = 0;
        let frames = 200 / 1000 * 60; // 60 frames per second, FIX the hardcoded time (200) according the game speed

        requestAnimationFrame(animate);

        function animate() {
            canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);

            snakeState.currentPosition.forEach((index: number, i: number) => {
                
                const { x: xTo, y: yTo } = getCoordinatesFromIndex(index, gridSize);
                let params = {
                    xFrom: xTo,
                    yFrom: yTo,
                    xTo: xTo,
                    yTo: yTo,
                };

                if (snakeState.previousPosition && snakeState.previousPosition[i] !== undefined) {
                    const { x: xFrom, y: yFrom  } = getCoordinatesFromIndex(snakeState.previousPosition[i], gridSize);
                    params.xFrom = xFrom;
                    params.yFrom = yFrom;
                }
                
                canvasContext.fillStyle = i % 2 === 0 ? '#F5F5F5' : '#CFCFCF'; // FIX the hardcoded color
                drawSnakePart(params);

                /*let snakePart = i === 0 ? "head" : i === snakeState.currentPosition.length - 1 ? "tail" : "body";
                
                grid[index].classList.add("snake", snakePart);
                grid[index].classList.remove("apple");
                grid[index].style.backgroundColor = snakeState.color;

                if (i === 0) {
                    // Set direction for snake head
                    grid[index].dataset.direction = this.directionMap[snakeState.currentDirection];
                } else if (i === snakeState.currentPosition.length - 1) {
                    // Clean up direction for previous snake tail
                    const previousTailIndex = snakeState.previousPosition[snakeState.previousPosition.length - 1];
                    delete grid[previousTailIndex].dataset.direction;

                    // Set direction for snake tail
                    const lastBodyIndex = snakeState.currentPosition[snakeState.currentPosition.length - 2];
                    grid[index].dataset.direction = grid[lastBodyIndex].dataset.direction;
                }*/
            });

            if (frame < frames && snakeState.previousPosition.length > 0) {
                frame++;
                requestAnimationFrame(animate);
            }
        }

        function drawSnakePart(params: { xTo: number, xFrom: number, yTo: number, yFrom: number }) {
            let x = getX(params);
            let y = getY(params);

            canvasContext.fillRect(x + params.xFrom, y + params.yFrom, 20, 20);
            
            return params;
        }

        function getCoordinatesFromIndex(index: number, gridSize: number) {
            const x = (index % gridSize) * 20;
            const y = Math.floor(index / gridSize) * 20;
            return { x, y };
        }
        
        function getX(params: { xTo: number, xFrom: number }) {
            let distance = params.xTo - params.xFrom;
            let steps = frames;
            let progress = frame;

            return distance / steps * progress;
        }

        function getY(params: { yTo: number, yFrom: number }) {
            let distance = params.yTo - params.yFrom;
            let steps = frames;
            let progress = frame;

            return distance / steps * progress;
        }
    }

    static control (e: KeyboardEvent, snakeInstance: any, columns: number, socket: Socket) {
        if (!snakeInstance.canMove) return;

        if (e.key === this.controlKeys.right && snakeInstance.currentDirection !== -1) {
            snakeInstance.currentDirection = 1;
            socket.emit('snake-control', { direction: 'right' });
        } else if (e.key === this.controlKeys.up && snakeInstance.currentDirection !== columns) {
            snakeInstance.currentDirection = -columns;
            socket.emit('snake-control', { direction: 'up' })
        } else if (e.key === this.controlKeys.left && snakeInstance.currentDirection !== 1) {
            snakeInstance.currentDirection = -1;
            socket.emit('snake-control', { direction: 'left' });
        } else if (e.key === this.controlKeys.down && snakeInstance.currentDirection !== -columns) {
            snakeInstance.currentDirection = columns;
            socket.emit('snake-control', { direction: 'down' });
        }
    }
}
