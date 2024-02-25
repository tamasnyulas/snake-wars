import CollectibleState from "@domain/ValueObject/CollectibleState";
import { Service } from "typedi";

@Service()
export default class CollectibleFactory {
    private maxValue: number = 5;

    createOnGrid(grid: number[]): CollectibleState {
        const randomValue = Math.floor(Math.random() * this.maxValue) + 1;
        const collectible = new CollectibleState();
        collectible.value = randomValue;
        collectible.position = this.getRandomPosition(grid);
        collectible.speedBomb = (Math.random() < 0.2);

        return collectible;
    }

    private getRandomPosition(grid: number[]): number {
        const emptySquares = grid.reduce((acc: number[], field: number, index: number) => {
            if (field === 0) {
                acc.push(index);
            }
            return acc;
        }, []);

        const randomIndex = Math.floor(Math.random() * emptySquares.length);

        return emptySquares[randomIndex];
    }
}