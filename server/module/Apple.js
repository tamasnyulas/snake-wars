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

        return appleInstance;
    },

    getRandomPosition: function (grid) {
        const emptySquares = grid.reduce((acc, field, index) => {
            if (field === null) {
                acc.push(index);
            }
            return acc;
        }, []);

        const randomIndex = Math.floor(Math.random() * emptySquares.length);

        return emptySquares[randomIndex];
    },

    getColor: function (value) {
        return this.colors[value - 1];
    },
};
