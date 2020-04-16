/*
* author lovepsone
*/

let _colors = [];

for (let i = 0; i < 32*32; ++ i) {

    _colors[i * 3] = 0;
    _colors[i * 3 + 1] = 1;
    _colors[i * 3 + 2] = 1;
}

import * as THREE from './../libs/three/Three.js';
import {COMMON_POINTS_BLOCK, POSITIONS} from './CONST.js';
import {GeneratePoints} from './GeneratePoints.js';

for (let i = 0; i < COMMON_POINTS_BLOCK.length; i++) {

    _colors[COMMON_POINTS_BLOCK[i] * 3] = 1;
    _colors[COMMON_POINTS_BLOCK[i] * 3 + 1] = 0;
    _colors[COMMON_POINTS_BLOCK[i] * 3 + 2] = 1;
}

let _tiles = null, _size = 128, _blocks = 4, _matrix = [];

class Tile {

    constructor(size) {

        _size = size;
        _blocks = _size*_size/1024;
        _tiles = new THREE.Group();
    
        const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: THREE.VertexColors, wireframe:true});
        const geometry = new THREE.PlaneBufferGeometry(32, 32, 31, 31);
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(_colors, 3));
        geometry.attributes.color.needsUpdate = true;
        geometry.rotateX(-Math.PI / 2);
		geometry.computeBoundingBox();
		geometry.center();
		geometry.computeFaceNormals();

        for (let i = 0; i < _blocks; i++) {

            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(POSITIONS[_size][i]);
            _tiles.add(mesh);
        }
    
        let tmp = new GeneratePoints(_size);
        _matrix = tmp.generate();
    }

    setHeightMap(data) {

    }

    getTiles() {

        return _tiles;
    }
}

export {Tile}