/*
* author lovepsone
*/

let _Colors2DArray = null, _Texture2DArray = null, _Bump2DArray = null, _textures = [], _bump = [];
let _mesh = null, _material = null;
let _ChangeBiomes = false, _size = null;
let _TextureAtlasCanvas = document.createElement('canvas'), _BumpAtlasCanvas = document.createElement('canvas');

import * as THREE from './../libs/three.module.js';
import {BASEDATATEXTURES} from './CONST.js';

class TextureAtlas {

    constructor() {

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

            _bump[i] = new THREE.TextureLoader().load(`${BASEDATATEXTURES[i][1]}_bump.jpg`, function(img) {

                if (_size == null) _size = img.image.height;
                if (_size != img.image.height || _size != img.image.width) {

                    console.error(`TextureAtlas.js: (${img.name}) width and height are not the same!!!`);
                    exit;
                }

                const id = parseInt(img.name.replace(/[^\d]/g, ''));

                if (id == 0) {

                    _BumpAtlasCanvas.width = _size
                    _BumpAtlasCanvas.height = _size * BASEDATATEXTURES.length;
                }

                _BumpAtlasCanvas.getContext('2d').drawImage(img.image, 0, _size * id);
            });

            _bump[i].name = `b_id=${i}`;
            _bump[i].wrapS =_bump[i].wrapT = THREE.RepeatWrapping;
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
    * data = { bump, w, h }
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
    }

    ChangeBiomes() {

        _ChangeBiomes = true;
    }

    getChangeBiomes() {

        if (_ChangeBiomes) return true;
        return false;
    }

    GenerateMaterial(wireframe) {

        if (!(_mesh instanceof THREE.Mesh)) {

            console.warn('TextureAtlas.js: Create geometry before overlaying pen.');
            return;
		}

        if (_ChangeBiomes) {

            _material = new THREE.MeshPhongMaterial();//new THREE.MeshLambertMaterial();
            _material.onBeforeCompile = function(shader) {

                shader.uniforms.diffuses = {value: _Colors2DArray};
                shader.uniforms.textureArray = {value: _Texture2DArray};

                shader.vertexShader = 'out vec2 vUv;\n'  + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    [
                        '#include <begin_vertex>',
                        'vUv = uv;',
                        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                    ].join('\n')
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <clipping_planes_pars_fragment>',
                    [
                        '#include <clipping_planes_pars_fragment>',
                        'precision highp sampler2DArray;',
                        //'precision highp float;',
                        //'precision highp int;',
                        'in vec2 vUv;',
                        'uniform sampler2DArray diffuses;',
                        'uniform sampler2DArray textureArray;',
                    ].join('\n')
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <dithering_fragment>',
                    [
                        '#include <dithering_fragment>',

                        'float _repeat = 10.0;',
                        'vec4 _diffuse = texture(diffuses, vec3(vUv, 0.0));                     //getCoord(0, 5)',
                        'vec4 _texture = texture(textureArray, vec3(vUv * _repeat, 0.0));',
                        'vec4 _mix = mix(_texture, vec4(0.0, 0.0, 0.0, 1.0), _diffuse.r);',
                        '_texture = texture(textureArray , vec3(vUv * _repeat, 1.0));',
                        '_mix = mix(_texture, _mix, _diffuse.g);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 2.0));',
                        '_mix = mix(_texture, _mix, _diffuse.b);',

                        '_diffuse = texture(diffuses, vec3(vUv, 1.0));',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 3.0));',
                        '_mix = mix(_texture, _mix, _diffuse.r);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 4.0));',
                        '_mix = mix(_texture, _mix, _diffuse.g);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 5.0));',
                        '_mix = mix(_texture, _mix, _diffuse.b);',

                        '_diffuse = texture(diffuses, vec3(vUv, 2.0));',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 6.0));',
                        '_mix = mix(_texture, _mix, _diffuse.r);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 7.0));',
                        '_mix = mix(_texture, _mix, _diffuse.g);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 8.0));',
                        '_mix = mix(_texture, _mix, _diffuse.b);',

                        '_diffuse = texture(diffuses, vec3(vUv, 3.0));',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 9.0));',
                        '_mix = mix(_texture, _mix, _diffuse.r);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 10.0));',
                        '_mix = mix(_texture, _mix, _diffuse.g);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 11.0));',
                        '_mix = mix(_texture, _mix, _diffuse.b);',

                        '_diffuse = texture(diffuses, vec3(vUv, 4.0));',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 12.0));',
                        '_mix = mix(_texture, _mix, _diffuse.r);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 13.0));',
                        '_mix = mix(_texture, _mix, _diffuse.g);',

                        'gl_FragColor *= _mix;'
                    ].join('\n')
                );
                _material.userData.shader = shader;
            }
        }

        if ( _material != null) {

            _mesh.material = _material;
            _mesh.castShadow = true;
            _mesh.receiveShadow = true;
            _mesh.material.needsUpdate = true;
        }

        _ChangeBiomes = false;
    }
}

export {TextureAtlas}