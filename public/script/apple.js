export const Apple = {
    createApple: function () {
        const randomValue = Math.floor(Math.random() * 5) + 1;
        const appleInstance = {
            value: randomValue,
            position: this.getRandomPosition(),
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

    renderApple: function (appleInstance) {
        const squares = document.querySelectorAll(".grid div");
        squares[appleInstance.position].classList.add("apple");
    }
};
