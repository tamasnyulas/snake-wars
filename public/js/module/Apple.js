export const Apple = {
    maxValue: 5,
    colors: ["one", "two", "three", "four", "five"],

    createApple: function (grid) {
        const randomValue = Math.floor(Math.random() * this.maxValue) + 1;
        const appleInstance = {
            value: randomValue,
            position: this.getRandomPosition(grid),
            color: this.getColor(randomValue),
            speedBomb: (Math.random() < 0.2),
        };

        this.renderApple(appleInstance, grid);

        return appleInstance;
    },

    getRandomPosition: function (grid) {
        const emptySquares = Array.from(grid).filter(grid => !grid.classList.contains("snake"));
        const randomIndex = Math.floor(Math.random() * emptySquares.length);

        return Array.from(grid).indexOf(emptySquares[randomIndex]);
    },

    getColor: function (value) {
        return this.colors[value - 1];
    },

    renderApple: function (appleInstance, grid) {
        grid[appleInstance.position].classList.add(
            "apple",
            appleInstance.color,
            appleInstance.speedBomb ? "speedBomb" : null
        );
    },
};
