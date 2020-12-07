/*
* author lovepsone
*/

let _Texture2DArray = null, _textures = [];
let _mesh = null, _material = null;
let _ChangeBiomes = false;

import * as THREE from './../libs/three/Three.js';
import {BASEDATATEXTURES} from './CONST.js';

class TextureAtlas {

    constructor() {

        for (let i = 0; i < BASEDATATEXTURES.length; i++) {

            _textures[i] = new THREE.TextureLoader().load(BASEDATATEXTURES[i][1]);
            _textures[i].name = BASEDATATEXTURES[i][1]; // need fixed
            _textures[i].wrapS =_textures[i].wrapT = THREE.RepeatWrapping;
        }
    }

    ReLoadTexrure(id, url) {

        _textures[id] = new THREE.TextureLoader().load(url);
        _textures[id].wrapS =_textures[id].wrapT = THREE.RepeatWrapping;
    }

	setTerrain(mesh) {

		_mesh = mesh;
    }

    /*
    * data = { bump, w, h }
    */
    setBiomeMap(data) {

        _Texture2DArray = new THREE.DataTexture2DArray(data.bump.getContext('2d').getImageData(0, 0, data.w, data.h * 5).data, data.w, data.h, 5);
        _Texture2DArray.format = THREE.RGBAFormat;
        _Texture2DArray.type = THREE.UnsignedByteType;
        _Texture2DArray.anisotropy = 2;
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

            _material = new THREE.MeshLambertMaterial();
            _material.onBeforeCompile = function(shader) {

                shader.uniforms.diffuses = {value: _Texture2DArray};
                shader.uniforms.OCEAN = {type: "t", value: _textures[0]};
                shader.uniforms.BEACH = {type: "t", value: _textures[1]};
                shader.uniforms.SCORCHED = {type: "t", value: _textures[2]};
                shader.uniforms.BARE = {type: "t", value: _textures[3]};
                shader.uniforms.TUNDRA = {type: "t", value: _textures[4]};
                shader.uniforms.SNOW = {type: "t", value: _textures[5]};
                shader.uniforms.TEMPERATE_DESERT = {type: "t", value: _textures[6]};
                shader.uniforms.TAIGA = {type: "t", value: _textures[7]};
                shader.uniforms.GRASSLAND = {type: "t", value: _textures[8]};
                shader.uniforms.TEMPERATE_DECIDUOUS_FOREST = {type: "t", value: _textures[9]};
                shader.uniforms.TEMPERATE_RAIN_FOREST = {type: "t", value: _textures[10]};
                shader.uniforms.SUBTROPICAL_DESERT = {type: "t", value: _textures[11]};
                shader.uniforms.TROPICAL_SEASONAL_FOREST = {type: "t", value: _textures[12]};
                shader.uniforms.TROPICAL_RAIN_FOREST = {type: "t", value: _textures[13]};

                shader.vertexShader = 'out vec2 vUv;\n'  + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    [
                        '#include <begin_vertex>',
                        'vUv = uv;',
                        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                    ].join('\n')
                );

                shader.fragmentShader = [
                    'precision highp sampler2DArray;',
                    //'precision highp float;',
                    //'precision highp int;',
                    'in vec2 vUv;',
                    'uniform sampler2D OCEAN;',
                    'uniform sampler2D BEACH;',
                    'uniform sampler2D SCORCHED;',
                    'uniform sampler2D BARE;',
                    'uniform sampler2D TUNDRA;',
                    'uniform sampler2D SNOW;',
                    'uniform sampler2D TEMPERATE_DESERT;',
                    'uniform sampler2D TAIGA;',
                    'uniform sampler2D GRASSLAND;',
                    'uniform sampler2D TEMPERATE_DECIDUOUS_FOREST;',
                    'uniform sampler2D TEMPERATE_RAIN_FOREST;',
                    'uniform sampler2D SUBTROPICAL_DESERT;',
                    'uniform sampler2D TROPICAL_SEASONAL_FOREST;',
                    'uniform sampler2D TROPICAL_RAIN_FOREST;',
                    'uniform sampler2DArray diffuses;',

                    'float getCoord(int layer, int count) {',

                    '    return max(0.0, min(float(count) - 1.0, floor(float(layer) + 0.5)));',
                    '}',
                ].join('\n') + shader.fragmentShader;

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <dithering_fragment>',
                    [
                        '#include <dithering_fragment>',

                        'vec4 diff_1 = texture(diffuses, vec3(vUv, 0.0));//getCoord(0, 5)',
                        'vec4 diff_2 = texture(diffuses, vec3(vUv, 1.0));',
                        'vec4 diff_3 = texture(diffuses, vec3(vUv, 2.0));',
                        'vec4 diff_4 = texture(diffuses, vec3(vUv, 3.0));',
                        'vec4 diff_5 = texture(diffuses, vec3(vUv, 4.0));',

                        'vec4 _okean = texture2D(OCEAN, vUv*10.0);',
                        'vec4 _beach = texture2D(BEACH, vUv* 10.0);',
                        'vec4 _scorched = texture2D(SCORCHED, vUv* 10.0);',

                        'vec4  _bare = texture2D(BARE, vUv* 10.0);',
                        'vec4 _tundra = texture2D(TUNDRA, vUv* 10.0);',
                        'vec4 _snow = texture2D(SNOW, vUv* 10.0);',

                        'vec4 _temperate_desert = texture2D(TEMPERATE_DESERT, vUv* 10.0);',
                        'vec4 _taiga = texture2D(TAIGA, vUv* 10.0);',
                        'vec4 _grassland = texture2D(GRASSLAND, vUv* 10.0);',

                        'vec4 _temperate_decidious_forest = texture2D(TEMPERATE_DECIDUOUS_FOREST, vUv* 10.0);',
                        'vec4 _temperate_rain_forest = texture2D(TEMPERATE_RAIN_FOREST, vUv* 10.0);',
                        'vec4 _subtropical_desert = texture2D(SUBTROPICAL_DESERT, vUv* 10.0);',

                        'vec4 _tropical_seasonal_forest = texture2D(TROPICAL_SEASONAL_FOREST, vUv* 10.0);',
                        'vec4 _tropical_rain_forest = texture2D(TROPICAL_RAIN_FOREST, vUv* 10.0);',

                        'vec4 _mix = mix(_okean, vec4(0.0, 0.0, 0.0, 1.0), diff_1.r);',
                        '_mix = mix(_beach, _mix, diff_1.g);',
                        '_mix = mix(_scorched, _mix, diff_1.b);',
                        '_mix = mix(_bare, _mix, diff_2.r);',
                        '_mix = mix(_tundra, _mix, diff_2.g);',
                        '_mix = mix(_snow, _mix, diff_2.b);',
                        '_mix = mix(_temperate_desert, _mix, diff_3.r);',
                        '_mix = mix(_taiga, _mix, diff_3.g);',
                        '_mix = mix(_grassland, _mix, diff_3.b);',
                        '_mix = mix(_temperate_decidious_forest, _mix, diff_4.r);',
                        '_mix = mix(_temperate_rain_forest, _mix, diff_4.g);',
                        '_mix = mix(_subtropical_desert, _mix, diff_4.b);',
                        '_mix = mix(_tropical_seasonal_forest, _mix, diff_5.r);',
                        '_mix = mix(_tropical_rain_forest, _mix, diff_5.g);',

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