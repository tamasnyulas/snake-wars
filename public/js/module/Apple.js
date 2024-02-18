export const Apple = {
    canvas: null,

    initiCanvas: function (width, height, canvasContainer) {
        this.canvas = document.createElement('canvas');
        canvasContainer.appendChild(this.canvas);
        this.canvas.width = width;
        this.canvas.height = height;
    },

    renderApple: function (appleInstance, gridSize) {
        const canvasContext = this.canvas.getContext('2d');

        canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
        canvasContext.beginPath();

        const { x, y } = this.getCoordinatesFromIndex(appleInstance.position, gridSize);
        canvasContext.fillStyle = 'red'; // TODO: use appleInstance.color & speedBomb style

        canvasContext.arc(x + 10, y + 10, 10, 0, 2 * Math.PI); // TODO: use snakeUnit to calculate the radius
        canvasContext.fill();
        canvasContext.closePath();

        /*grid[appleInstance.position].classList.add(
            "apple",
            appleInstance.color,
            appleInstance.speedBomb ? "speedBomb" : null
        );*/
    },

    // TODO: move this to an abstract class and reuse it for Apple and Snake respectively
    getCoordinatesFromIndex: function(index, gridSize) {
        const x = (index % gridSize) * 20;
        const y = Math.floor(index / gridSize) * 20;
        return { x, y };
    },
};
