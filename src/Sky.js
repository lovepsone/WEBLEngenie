/*
* @author lovepsone 2019 - 2021
*/

import {SKYSIZE, SKYDATATEXTURES} from './CONST.js';
import * as THREE from './../libs/three.module.js';

let _scene, _scope, _atlases = [], _textures = [];
let _Boxes = [];

class Sky {

    constructor(scene) {

        _scene = scene;
        _scope = this;

        for (let i = 0; i < SKYDATATEXTURES.length; i++) {
    
            _atlases[i] = new THREE.TextureLoader().load(SKYDATATEXTURES[i][1], function(img) {

                _Boxes[i] = new THREE.Mesh(new THREE.BoxBufferGeometry(700, 700, 700), _scope.getAtlasTextures(img.image));
                _Boxes[i].position.y = 300;
                _Boxes[i].visibly = false;
                _scene.add(_Boxes[i]);
            });
        }
    }

    getAtlasTextures(atlasImg) {

        const materials = [];
        let canvas;

        for (let i = 0; i < 6; i++) {

            const texture = new THREE.Texture();
            canvas = document.createElement('canvas');
            canvas.width = canvas.height = SKYSIZE;
            canvas.getContext('2d').drawImage(atlasImg, SKYSIZE * i, 0, SKYSIZE, SKYSIZE, 0, 0, SKYSIZE, SKYSIZE);
            texture.image = canvas;
            texture.needsUpdate = true;
            materials.push(new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide}));
        }

        return materials;
    }

    update(id) {

        for (let i = 0; i < _Boxes.length; i++) {

            _Boxes[i].visible = false;

            if (id == i) _Boxes[i].visible = true;
        }
    }
}

export {Sky};