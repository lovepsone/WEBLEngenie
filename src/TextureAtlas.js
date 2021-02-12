/*
* @author lovepsone 2019 - 2021
* @ver 0.1
*/

let _Colors2DArray = null, _Texture2DArray = null, _Normal2DArray = null, _textures = [], _normals = [];
let _mesh = null, _material = null, _packingTexture = null;
let _ChangeBiomes = false, _size = null;
let _TextureAtlasCanvas = document.createElement('canvas'), _NormalAtlasCanvas = document.createElement('canvas');

import * as THREE from './../libs/three.module.js';
import {BASEDATATEXTURES} from './CONST.js';
import {PackingTexture} from './PackingTexture.js';

class TextureAtlas {

    constructor() {

        _packingTexture = new PackingTexture();

        for (let i = 0; i < BASEDATATEXTURES.length; i++) {

            _textures[i] = new THREE.TextureLoader().load(`${BASEDATATEXTURES[i][1]}.jpg`, function(img) {

                if (_size == null) _size = img.image.height;
                if (_size != img.image.height || _size != img.image.width) {

                    console.error(`TextureAtlas.js: (${img.name}) width and height are not the same!!!`);
                    exit;
                }

                const id = parseInt(img.name.replace(/[^\d]/g, ''));

                if (id == 0) {

                    _TextureAtlasCanvas.width = _size
                    _TextureAtlasCanvas.height = _size * BASEDATATEXTURES.length;
                }

                _TextureAtlasCanvas.getContext('2d').drawImage(img.image, 0, _size * id);
            });

            _textures[i].name = `t_id=${i}`;
            _textures[i].wrapS =_textures[i].wrapT = THREE.RepeatWrapping;

            _normals[i] = new THREE.TextureLoader().load(`${BASEDATATEXTURES[i][1]}_normal.jpg`, function(img) {

                if (_size == null) _size = img.image.height;
                if (_size != img.image.height || _size != img.image.width) {

                    console.error(`TextureAtlas.js: (${img.name}) width and height are not the same!!!`);
                    exit;
                }

                const id = parseInt(img.name.replace(/[^\d]/g, ''));

                if (id == 0) {

                    _NormalAtlasCanvas.width = _size
                    _NormalAtlasCanvas.height = _size * BASEDATATEXTURES.length;
                }

                _NormalAtlasCanvas.getContext('2d').drawImage(img.image, 0, _size * id);
            });

            _normals[i].name = `n_id=${i}`;
            _normals[i].wrapS = _normals[i].wrapT = THREE.RepeatWrapping;
        }
    }

    ReLoadTexrure(id, url) {

        _textures[id] = new THREE.TextureLoader().load(url, function(img) {

            _TextureAtlasCanvas.getContext('2d').drawImage(img.image, 0, _size * id)
        });
        _textures[id].wrapS =_textures[id].wrapT = THREE.RepeatWrapping;

        //bump loading implementation required
    }

	setTerrain(mesh) {

		_mesh = mesh;
    }

    /*
    * data = { colors, w, h }
    */
    setBiomeMap(data) {

        _Colors2DArray = new THREE.DataTexture2DArray(data.colors.getContext('2d').getImageData(0, 0, data.w, data.h * 5).data, data.w, data.h, 5);
        _Colors2DArray.format = THREE.RGBAFormat;
        _Colors2DArray.type = THREE.UnsignedByteType;
        _Colors2DArray.anisotropy = 2;

        _Texture2DArray = new THREE.DataTexture2DArray(_TextureAtlasCanvas.getContext('2d').getImageData(0, 0, _size, _size * BASEDATATEXTURES.length).data, _size, _size, BASEDATATEXTURES.length);
        _Texture2DArray.format = THREE.RGBAFormat;
        _Texture2DArray.type = THREE.UnsignedByteType;
        _Texture2DArray.wrapS = _Texture2DArray.wrapT = _Texture2DArray.wrapR = THREE.RepeatWrapping;
        _Texture2DArray.anisotropy = 2;

        _Normal2DArray = new THREE.DataTexture2DArray(_NormalAtlasCanvas.getContext('2d').getImageData(0, 0, _size, _size * BASEDATATEXTURES.length).data, _size, _size, BASEDATATEXTURES.length);
        _Normal2DArray.format = THREE.RGBAFormat;
        _Normal2DArray.type = THREE.UnsignedByteType;
        _Normal2DArray.wrapS = _Normal2DArray.wrapT = _Normal2DArray.wrapR = THREE.RepeatWrapping;
        _Normal2DArray.anisotropy = 2;
    
        _packingTexture.setTexturesDiffuse(_textures);
        _packingTexture.setTexturesNormal(_normals);
        _packingTexture.setColorsMap(data.colors, data.w, 5);
    }

    ChangeBiomes() {

        _ChangeBiomes = true;
    }

    getChangeBiomes() {

        if (_ChangeBiomes) return true;
        return false;
    }

    GenerateMaterial(wireframe = true) {

        if (!(_mesh instanceof THREE.Mesh)) {

            console.warn('TextureAtlas.js: Create geometry before overlaying pen.');
            return;
		}

        if (_ChangeBiomes) {

            //https://gist.github.com/emilio-martinez/d293ad7e6794cd2c954ee3c414e90173
            const buf = _packingTexture.mix();
            const map = new THREE.CanvasTexture(buf.diffuse);
            map.flipY = false;
            map.anisotropy = 4;
            const normal = new THREE.CanvasTexture(buf.normal);
            normal.flipY = false;
            normal.anisotropy = 4;

            _material = new THREE.MeshPhongMaterial({
                wireframe: wireframe,
                map: map,
                normalMap: normal,
                normalScale: new THREE.Vector2(0.8, 0.8),
            });
        }

        if ( _material != null) {

            _mesh.castShadow = true;
            _mesh.receiveShadow = true;
            _mesh.material = _material;
            _mesh.material.needsUpdate = true;
            //_mesh.material.wireframe = wireframe;
        }

        _ChangeBiomes = false;
    }

    clear() {

        _material = null;
    }

    LoadCompleteTexture(url) {

        new THREE.TextureLoader().load(url, function(img) {

            _material = new THREE.MeshPhongMaterial({
                //wireframe: wireframe,
                map: img,
                //normalMap: normal,
                //normalScale: new THREE.Vector2(0.8, 0.8),
            });

            _mesh.material = _material;
            _mesh.material.needsUpdate = true;
        });
    }
}

export {TextureAtlas}