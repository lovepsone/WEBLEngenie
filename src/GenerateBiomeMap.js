/*
* author lovepsone
*/

import * as THREE from '../libs/three/Three.js';

let _colors = null;
let _canvas = document.createElement('canvas'), _ctx = null;
let _width = 128, _height = 128, _matrix = [];
let _material = null;

let _DiffuseCanvas = document.createElement('canvas');

class GenerateBiomeMap {

    constructor(elemId = 'TerrainMap') {

        _DiffuseCanvas.width = _width;
        _DiffuseCanvas.height = _height*5;
        _DiffuseCanvas.style.width = "256px";
        _DiffuseCanvas.style.height = "1280px";
        //document.getElementById(elemId).appendChild(_DiffuseCanvas);  

        _canvas.width = _width;
        _canvas.height = _height;
        _canvas.style.width = "256px";
        _canvas.style.height = "256px";
        _ctx = _canvas.getContext('2d');
        document.getElementById(elemId).appendChild(_canvas);
        this.setSize(128, 128);
    }

    setSize(width, height) {

        _DiffuseCanvas.width = width;
        _DiffuseCanvas.height = height*5;
        _DiffuseCanvas.getContext('2d').clearRect(0, 0, width,  height*5);
        _DiffuseCanvas.getContext('2d').fillStyle = '#ffff00';
        _DiffuseCanvas.getContext('2d').fillRect(0, 0, width,  height*5);
    
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

    generateBUMPs(colors, x, y) {

        let buf = '#';
        const w = Number.parseInt(_width), h = Number.parseInt(_height);
        // 3 канала r, g, b
        buf += (colors == '44447a') ? '00': 'ff'; //OCEAN
        buf += (colors == 'a09077') ? '00': 'ff'; //BEACH
        buf += (colors == '555555') ? '00': 'ff'; //SCORCHED
        _DiffuseCanvas.getContext('2d').fillStyle = buf;
        _DiffuseCanvas.getContext('2d').fillRect(x, h - (y + 1), 1, 1);

        buf = '#';
        buf += (colors == '888888') ? '00': 'ff'; //BARE
        buf += (colors == 'bbbbaa') ? '00': 'ff'; //TUNDRA
        buf += (colors == 'dddde4') ? '00': 'ff'; //SNOW
        _DiffuseCanvas.getContext('2d').fillStyle = buf;
        _DiffuseCanvas.getContext('2d').fillRect(x, h*2 - (y + 1), 1, 1);

        buf = '#';
        buf += (colors == 'c9d29b') ? '00': 'ff'; //TEMPERATE_DESERT
        buf += (colors == '99aa77') ? '00': 'ff'; //TAIGA
        buf += (colors == '88aa55') ? '00': 'ff'; //GRASSLAND
        _DiffuseCanvas.getContext('2d').fillStyle = buf;
        _DiffuseCanvas.getContext('2d').fillRect(x, h*3 - (y + 1), 1, 1);

        buf = '#';
        buf += (colors == '679459') ? '00': 'ff'; //TEMPERATE_DECIDUOUS_FOREST
        buf += (colors == '448855') ? '00': 'ff'; //TEMPERATE_RAIN_FOREST
        buf += (colors == 'd2b98b') ? '00': 'ff'; //SUBTROPICAL_DESERT
        _DiffuseCanvas.getContext('2d').fillStyle = buf;
        _DiffuseCanvas.getContext('2d').fillRect(x, h*4 - (y + 1), 1, 1);

        buf = '#';
        buf += (colors == '559944') ? '00': 'ff'; //TROPICAL_SEASONAL_FOREST
        buf += (colors == '337755') ? '00': 'ff'; //TROPICAL_RAIN_FOREST
        buf += 'ff';
        _DiffuseCanvas.getContext('2d').fillStyle = buf;
        _DiffuseCanvas.getContext('2d').fillRect(x, h*5 - (y + 1), 1, 1);
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
            this.generateBUMPs(_matrix[y][x], x, y);
            _ctx.fillStyle = '#' + _matrix[y][x];
            _ctx.fillRect(x, y, 1, 1);         
            x++;
        }
    }
}

export {GenerateBiomeMap};