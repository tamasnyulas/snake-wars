export const Apple = {
    canvas: null,

    initialize: function (width, height, canvasContainer) {
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
        canvasContext.fillStyle = this.getColor(appleInstance.value); // TODO: use appleInstance.color & speedBomb style

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

    getColor: function(value) {
        switch (value) {
            case 1:
                return "rgb(0, 255, 85)";
            case 2:
                return "rgb(0, 89, 255)";
            case 3:
                return "rgb(153, 0, 255)";
            case 4:
                return "rgb(237, 181, 14)";
            case 5:
                return "rgb(255, 0, 140)";
        }
    },
};
