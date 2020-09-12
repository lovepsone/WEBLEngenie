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
        let vShader = `
            out vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        let fShader = `
            precision highp sampler2DArray;
            precision highp float;
            precision highp int;

            uniform sampler2D OCEAN;
            uniform sampler2D BEACH;
            uniform sampler2D SCORCHED;
            uniform sampler2D BARE;
            uniform sampler2D TUNDRA;
            uniform sampler2D SNOW;
            uniform sampler2D TEMPERATE_DESERT;
            uniform sampler2D TAIGA;
            uniform sampler2D GRASSLAND;
            uniform sampler2D TEMPERATE_DECIDUOUS_FOREST;
            uniform sampler2D TEMPERATE_RAIN_FOREST;
            uniform sampler2D SUBTROPICAL_DESERT;
            uniform sampler2D TROPICAL_SEASONAL_FOREST;
            uniform sampler2D TROPICAL_RAIN_FOREST;

            in vec2 vUv;
            uniform sampler2DArray diffuse;

            float getCoord(int layer, int count) {

                return max(0.0, min(float(count) - 1.0, floor(float(layer) + 0.5)));
            }

            void main() {

                vec4 diff_1 = texture(diffuse, vec3(vUv, 0.0));//getCoord(0, 5)
                vec4 diff_2 = texture(diffuse, vec3(vUv, 1.0));
                vec4 diff_3 = texture(diffuse, vec3(vUv, 2.0));
                vec4 diff_4 = texture(diffuse, vec3(vUv, 3.0));
                vec4 diff_5 = texture(diffuse, vec3(vUv, 4.0));

                vec4 _okean = texture2D(OCEAN, vUv*10.0);
                vec4 _beach = texture2D(BEACH, vUv* 10.0);
                vec4 _scorched = texture2D(SCORCHED, vUv* 10.0);

                vec4 _bare = texture2D(BARE, vUv* 10.0);
                vec4 _tundra = texture2D(TUNDRA, vUv* 10.0);
                vec4 _snow = texture2D(SNOW, vUv* 10.0);

                vec4 _temperate_desert = texture2D(TEMPERATE_DESERT, vUv* 10.0);
                vec4 _taiga = texture2D(TAIGA, vUv* 10.0);
                vec4 _grassland = texture2D(GRASSLAND, vUv* 10.0);

                vec4 _temperate_decidious_forest = texture2D(TEMPERATE_DECIDUOUS_FOREST, vUv* 10.0);
                vec4 _temperate_rain_forest = texture2D(TEMPERATE_RAIN_FOREST, vUv* 10.0);
                vec4 _subtropical_desert = texture2D(SUBTROPICAL_DESERT, vUv* 10.0);

                vec4 _tropical_seasonal_forest = texture2D(TROPICAL_SEASONAL_FOREST, vUv* 10.0);
                vec4 _tropical_rain_forest = texture2D(TROPICAL_RAIN_FOREST, vUv* 10.0);

                vec4 mix1 = mix(_okean, vec4(0.0, 0.0, 0.0, 1.0), diff_1.r);
                vec4 mix2 = mix(_beach, mix1, diff_1.g);
                vec4 mix3 = mix(_scorched, mix2, diff_1.b);
                vec4 mix4 = mix(_bare, mix3, diff_2.r);
                vec4 mix5 = mix(_tundra, mix4, diff_2.g);
                vec4 mix6 = mix(_snow, mix5, diff_2.b);
                vec4 mix7 = mix(_temperate_desert, mix6, diff_3.r);
                vec4 mix8 = mix(_taiga, mix7, diff_3.g);
                vec4 mix9 = mix(_grassland, mix8, diff_3.b);
                vec4 mix10 = mix(_temperate_decidious_forest, mix9, diff_4.r);
                vec4 mix11 = mix(_temperate_rain_forest, mix10, diff_4.g);
                vec4 mix12 = mix(_subtropical_desert, mix11, diff_4.b);
                vec4 mix13 = mix(_tropical_seasonal_forest, mix12, diff_5.r);
                vec4 mix14 = mix(_tropical_rain_forest, mix13, diff_5.g);
                gl_FragColor = mix14;
            }
            `;

        let customUniforms = {
            diffuse:                    {value: _Texture2DArray},
            OCEAN:	                    {type: "t", value: _textures[0]},
            BEACH:	                    {type: "t", value: _textures[1]},
            SCORCHED:	                {type: "t", value: _textures[2]},
            BARE:	                    {type: "t", value: _textures[3]},
            TUNDRA:	                    {type: "t", value: _textures[4]},
            SNOW:	                    {type: "t", value: _textures[5]},
            TEMPERATE_DESERT:	        {type: "t", value: _textures[6]},
            TAIGA:	                    {type: "t", value: _textures[7]},
            GRASSLAND:	                {type: "t", value: _textures[8]},
            TEMPERATE_DECIDUOUS_FOREST:	{type: "t", value: _textures[9]},
            TEMPERATE_RAIN_FOREST:	    {type: "t", value: _textures[10]},
            SUBTROPICAL_DESERT:	        {type: "t", value: _textures[11]},
            TROPICAL_SEASONAL_FOREST:	{type: "t", value: _textures[12]},
            TROPICAL_RAIN_FOREST:	    {type: "t", value: _textures[13]},
        };

        if (_ChangeBiomes) {

            _material = new THREE.ShaderMaterial({
                uniforms: customUniforms,
                vertexShader: vShader,
                fragmentShader: fShader,
                wireframe: wireframe
            });
    
        }

        if ( _material != null) {

            _mesh.material = _material;
            _mesh.material.needsUpdate = true;
        }

        _ChangeBiomes = false;
    }
}

export {TextureAtlas}