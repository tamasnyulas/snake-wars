export const Apple = {
    renderApple: function (appleInstance, grid) {
        grid[appleInstance.position].classList.add(
            "apple",
            appleInstance.color,
            appleInstance.speedBomb ? "speedBomb" : null
        );
    },
};
