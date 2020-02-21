/*
* author lovepsone
*/

let _position;
let _size = 0;
let _BigMatrix = [];
let _SmallMatries = [];
/* 
* width and depth = 128 || 256 || 512
*
* SIZE_DIVIDER = 8
*
* size | count| width and depth
* 8x8  |  16  | 128 (8 * 16 = 128)
* 8x8  |  32  | 256 (8 * 32 = 256)
* 8x8  |  64  | 512 (8 * 64 = 512)
*/

const SIZE_DIVIDER = 16; // 8, 16, 32

class Tile {

    constructor(position, size) {

        _position = position;
        _size = size;

        this.setBigMatrix(_position);
    }

    setBigMatrix(position) {

        let line = 0, colum = 0;
        _BigMatrix[line] = [];

        for (let i = 0; i < position.count; i++) {

            _BigMatrix[line][colum] = [position.array[i + 0], position.array[i + 1], position.array[i + 2]];
            colum++;

            if (colum == _size) {

                colum = 0;
                line++;
                if (line < _size) _BigMatrix[line] = []; 
            }

        }

        this.setSmallMatries(_BigMatrix);
    }

    setSmallMatries(matrix) {

        let NumMatries = 0, offset = 0;
        _SmallMatries[NumMatries] = [];

        for (let i = 0; i < matrix.length; i++) {

            if ((i % SIZE_DIVIDER == 0) && i != 0) {

                offset += _size / SIZE_DIVIDER;
                if (!Array.isArray(_SmallMatries[ offset])) _SmallMatries[ offset] = [];
            }

            NumMatries = 0 + offset;

            for (let j = 0; j < matrix[i].length; j++) {

                if ((j % SIZE_DIVIDER) == 0 && j != 0) {

                    NumMatries++;
                    if (!Array.isArray(_SmallMatries[NumMatries])) _SmallMatries[NumMatries] = [];
                }

                _SmallMatries[NumMatries].push(matrix[i][j]);
            }
        }
    }

}

export {Tile}