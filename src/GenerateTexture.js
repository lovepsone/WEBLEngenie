/*
* author lovepsone
*/

import * as THREE from './../libs/three/Three.js';

let _colors = null;
let _canvas = document.createElement('canvas'), _ctx = null;
let _width = 128, _height = 128, _matrix = [];

class GenerateTexture {

    constructor(elemId = 'test_img') {

        _canvas.width = _width;
        _canvas.height = _height;
        _canvas.style.width = "256px";
        _canvas.style.height = "256px";
        _ctx = _canvas.getContext('2d');
        document.getElementById(elemId).appendChild(_canvas);
        this.setSize(128, 128)
    }

    setSize(width, height) {

        _ctx.clearRect(0, 0, _width, _height);
        _width = width;
        _height = height;
        _canvas.width = _width;
        _canvas.height =  _height;
        _ctx.fillStyle = '#555';
        _ctx.fillRect(0, 0, _width, _height);

        _matrix = [];
        
        for(let i = 0; i < _width; i++) {
            
            _matrix.push([]);
            
            for(let j = 0; j < _height; j++) {
                
                _matrix[i].push('');
            }
        }
    }

    setColorsDataBiomes(array) {

        let x = 0, y = 0;

        for (let i = 0; i < array.count; i++) {

            const color = new THREE.Color(
                array.array[i * 3 + 0],
                array.array[i * 3 + 1],
                array.array[i * 3 + 2]
            );

            if (i % _width == 0 && i != 0) {

                y++;
                x = 0;
            }
    
            _matrix[y][x] = color.getHexString();
            _ctx.fillStyle = '#' + _matrix[y][x];
            _ctx.fillRect(x, y, 1, 1);         
            x++;
        }

    }
}

export {GenerateTexture};