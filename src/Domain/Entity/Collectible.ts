const Collectible = {
    maxValue: 5,

    createApple: function (grid: []) {
        const randomValue = Math.floor(Math.random() * this.maxValue) + 1;
        const appleInstance = {
            value: randomValue,
            position: this.getRandomPosition(grid),
            speedBomb: (Math.random() < 0.2),
        };

        return appleInstance;
    },

    getRandomPosition: function (grid: []) {
        const emptySquares = grid.reduce((acc: number[], field: number, index: number) => {
            if (field === 0) {
                acc.push(index);
            }
            return acc;
        }, []);

        const randomIndex = Math.floor(Math.random() * emptySquares.length);

        return emptySquares[randomIndex];
    },
};

export default Collectible;
