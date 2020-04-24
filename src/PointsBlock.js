
/*
* Author lovepsone
*/

import {SIZE_64x64, SIZE_128x128, SIZE_256x256, SIZE_512x512} from './CONST.js';

let _size = 64;

class PointsBlock {

    constructor(size) {

        this.size = size;
        this.blocks = [];

        let id = 0, value = 0, count = 0, RESize = this.getCountBlock();

        for (let i = 0; i < 32; i++) {

            id = 0;
            value = i * 32;
    
            for (let j = 0; j < RESize; j++) {
    
                if ((value % 32) == 0 && (value != i * 32)) {
    
                    id ++;
                    value = i * 32;
                    this.blocks[count - 1] = [this.blocks[count - 1][0], this.blocks[count - 1][1], id, value];
                    value++;
                }

                this.blocks.push([id, value]);
                value++;
                count++;
            }
        }
    }

    OffsetBlocks() {

        let offset = this.getOffsetBlocks();

        for(let i = 0; i < this.blocks.length; i++) {
    
            for (let j = 0; j < this.blocks[i].length; j += 2) {

                this.blocks[i][j] += offset;
            }
        }
    }

    UnionBlock(data) {

        if (!(data instanceof PointsBlock)) {

            console.error('Input is not a class PointsBlock', data);
            return;
        } else if (this.size != data.size) {

            console.error('Block sizes do not match', this.size,'!=', data.size);
            return;   
        }

        let j = 0, count = this.blocks.length - this.getCountBlock(), length = this.blocks.length;

        for(let i = count; i < length; i++) {

            for (let n = 0; n < data.blocks[j].length; n++) {

                const tmp = data.blocks[j][n];
                //this.blocks[i].push(tmp);
                this.blocks[i][this.blocks[i].length] = tmp;
            }
            j++;
        }

        count = this.getCountBlock();
        length = data.blocks.length;

        for (let i = count; i < length; i++) {

            const tmp = data.blocks[i].slice();
            this.blocks.push(tmp);
        }
    }

    getCountBlock() {

        let result = 0;

        switch(this.size) {
    
            case 64:
                result = 64 - 1;
                break;
    
            case 128:
                result = 128 - 3;
                break;
    
            case 256:
                result = 256 - 7;
                break;
    
            case 512:
                result = 512 - 15;
                break;
        }

        return result;
    }

    getOffsetBlocks() {

        let result = 2;
    
        switch(this.size) {
    
            case 64:
                result = Math.sqrt(SIZE_64x64);
                break;
    
            case 128:
                result = Math.sqrt(SIZE_128x128);
                break;
    
            case 256:
                result = Math.sqrt(SIZE_256x256);
                break;
    
            case 512:
                result = Math.sqrt(SIZE_512x512);
                break;
        }
    
        return result;
    }
}

export {PointsBlock}