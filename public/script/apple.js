export const Apple = {
    maxValue: 5,
    colors: ["red", "orange", "yellow", "lightyellow", "gold"],

    createApple: function () {
        const randomValue = Math.floor(Math.random() * this.maxValue) + 1;
        const appleInstance = {
            value: randomValue,
            position: this.getRandomPosition(),
            color: this.getColor(randomValue),
        };

        this.renderApple(appleInstance);

        return appleInstance;
    },

    getRandomPosition: function () {
        const squares = document.querySelectorAll(".grid div");
        const emptySquares = Array.from(squares).filter(square => !square.classList.contains("snake"));
        const randomIndex = Math.floor(Math.random() * emptySquares.length);

        return Array.from(squares).indexOf(emptySquares[randomIndex]);
    },

    getColor: function (value) {
        return this.colors[value - 1];
    },

    renderApple: function (appleInstance) {
        const squares = document.querySelectorAll(".grid div");
        squares[appleInstance.position].classList.add("apple");
        squares[appleInstance.position].classList.add(appleInstance.color);
    },
};
