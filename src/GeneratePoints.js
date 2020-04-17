
/*
* Author lovepsone
*/

import {SIZE_64x64, SIZE_128x128, SIZE_256x256, SIZE_512x512} from './CONST.js';

let _size = 64;

export class GeneratePoints {

    constructor(size) {
        
        _size = size;
    }

    getRESize(size) {

        let result = 0;
    
        switch(size) {
    
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

    getLineCount(size) {

        let result = 2;
    
        switch(size) {
    
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

    getPointsLineBlocks() {

        let id = 0, tmp = [], value = 0, count = 0, RESize = this.getRESize(_size);
    
        for (let i = 0; i < 32; i++) {
    
            id = 0;
            value = i * 32;
    
            for (let j = 0; j < RESize; j++) {
    
                if ((value % 32) == 0 && (value != i * 32)) {
    
                    id ++;
                    const t = value - 1;
                    value = i * 32;
                    tmp[count - 1].value = [t, id, value];
                    value++;
                }
    
                tmp.push({id: id, value: value});
                value++;
                count++; // array id tmp
            }
        }
    
        return tmp;
    }

    UpIdLineBlocks(data) {

        let tmp = this.getLineCount(_size), result = [];
    
        for(let i = 0; i < data.length; i++) {
    
            if (Array.isArray(data[i].value)) {
    
                result.push({id: data[i].id + tmp, value: [data[i].value[0], data[i].value[1] + tmp, data[i].value[2]]});
            } else {
    
                result.push({id: data[i].id + tmp, value: data[i].value});
            }
        }
    
        return result;
    }

    UnionBlocks(data1, data2) {
    
        let j = 0;
    
        for(let i = data1.length - this.getRESize(_size); i < data1.length; i++) {
    
            if (Array.isArray(data2[j].value)) {
    
                data1[i].value.push(data2[j].id, data2[j].value[0], data2[j].value[1], data2[j].value[2]);
            } else {
    
                const tmp = data1[i].value;
                data1[i].value = [];
                data1[i].value.push(tmp, data2[j].id, data2[j].value);
            }
    
            j++;
        }
    
        for (let i = this.getRESize(_size); i < data2.length; i++) {
    
            data1.push(data2[i])
        }

        data2 = null;
        //return data1;
    }

    generate() {

        let result = this.getPointsLineBlocks();

        for (let i = 0; i < this.getLineCount(_size) - 1; i++) {

            let tmp = this.UpIdLineBlocks(result);
            this.UnionBlocks(result, tmp);
            tmp = null;
        }

        return result;
    }
};