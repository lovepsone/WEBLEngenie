
/*
* https://gitlab.com/isaacmason/random-terrain/-/tree/master
*/
let _size = 64,  _roughness = 500, _map = null;

export class NoiseDiamondSquare {

    constructor(size) {

        size = Number.parseInt(size);
        _size = size + 1;
        _map = new Array(_size);

        for (let i = 0; i < _size; i++) _map[i] = new Array(_size).fill(0);
    }

    setSize(size) {

        size = Number.parseInt(size);
        _size = size + 1;
        _map = new Array(_size);

        for (let i = 0; i < _size; i++) _map[i] = new Array(_size).fill(0);
    }

    diamondStep(sideLength, range) {

        const halfSideLength = Math.floor(sideLength / 2);

        for (let y = 0; y < Math.floor(_size / (sideLength - 1)); y++) {

            for (let x = 0; x < Math.floor(_size / (sideLength - 1)); x++) {

                // Find the center of the square
                const centerX = x * (sideLength - 1) + halfSideLength;
                const centerY = y * (sideLength - 1) + halfSideLength;
                
                // Find the average corners value
                let average = (
                    _map[y * (sideLength - 1)][x * (sideLength - 1)] +
                    _map[(y + 1) * (sideLength - 1)][x * (sideLength - 1)] +
                    _map[y * (sideLength - 1)][(x + 1) * (sideLength - 1)] +
                    _map[(y + 1) * (sideLength - 1)][(x + 1) * (sideLength - 1)]
                ) / 4.0;

                // Set the center midpoint of the square to be the average of the four corner points plus a random value between -range to range
                _map[centerY][centerX] = average + +(-range + Math.random() * ((range - -range) + 1));
            }
        }
    }

    squareStep(sideLength, range) {

        const halfSideLength = Math.floor(sideLength / 2);

        for (let y = 0; y < Math.floor(_size / (sideLength - 1)); y++) {

            for (let x = 0; x < Math.floor(_size / (sideLength - 1)); x++) {

                // Store the four diamond midpoints
                [
                    [y * (sideLength - 1) + halfSideLength, x * (sideLength - 1)], // left
                    [y * (sideLength - 1) + halfSideLength, (x + 1) * (sideLength - 1)], // right
                    [y * (sideLength - 1), x * (sideLength - 1) + halfSideLength], // top
                    [(y + 1) * (sideLength - 1), x * (sideLength - 1) + halfSideLength] // bottom
                ].map((diamondMidPoint) => {

                    // Find the sum of the diamond corner values
                    let counter = 0;
                    let sum = 0;

                    if (diamondMidPoint[1] !== 0) { // left

                        counter += 1.0;
                        sum += _map[diamondMidPoint[0]][diamondMidPoint[1] - halfSideLength];
                    }

                    if (diamondMidPoint[0] !== 0) { // top

                        counter += 1.0;
                        sum += _map[diamondMidPoint[0] - halfSideLength][diamondMidPoint[1]];
                    }

                    if (diamondMidPoint[1] !== _size - 1) { // right

                        counter += 1.0;
                        sum += _map[diamondMidPoint[0]][diamondMidPoint[1] + halfSideLength];
                    }

                    if (diamondMidPoint[0] !== _size - 1) { // bottom
    
                        counter += 1.0;
                        sum += _map[diamondMidPoint[0] + halfSideLength][diamondMidPoint[1]];
                    }

                    // Set the center point to be the average of the diamond corner values
                    _map[diamondMidPoint[0]][diamondMidPoint[1]] = (sum / counter) + (-range + Math.random() * ((range - -range) + 1));
                });
            }
        }
    }

    Generate() {

        /* Use the diamond step / cloud fractal algorithm to generate a random height map */
        // Initialise corners with random values (_map[y][x])
        _map[0][0] = Math.random() * _roughness - 1;
        _map[0][_size - 1] = Math.random() * _roughness - 1;
        _map[_size - 1][0] = Math.random() * _roughness - 1;
        _map[_size - 1][_size - 1] = Math.random() * _roughness - 1;

        // Do an initial diamond and square step
        this.diamondStep(_size, _roughness);
        this.squareStep(_size, _roughness);

        // Calculate the next side length
        let sideLength = Math.floor(_size / 2);

        // Loop until the side length is less than 2
        while (sideLength >= 2) {
            
            // Perform a diamond and a square step
            this.diamondStep(sideLength + 1, _roughness);
            this.squareStep(sideLength + 1, _roughness);
        
            // Half the side length and range
            sideLength = Math.floor(sideLength / 2);
            _roughness = Math.floor(_roughness / 2);
        }

        let min = 0, max = 0;

        for (let i = 0; i < _map.length; i++) {

            for (let j = 0; j < _map[i].length; j++) {

                _map[i][j] *= 10;
                max = _map[i][j] > max ? _map[i][j] : max;
				min = _map[i][j] < min ? _map[i][j] : min;
            }
        }

        for (let i = 0; i < _map.length; i++) {

            for (let j = 0; j < _map[i].length; j++) {

                _map[i][j] = this.revertToColor(min, max, _map[i][j]);
            }
        }

        return _map;
    }

    revertToColor(min, max, val) {

        return Math.round((((val - min) * 255) / (max - min)) + 0);
    }
};