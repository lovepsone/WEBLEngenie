/*
* author lovepsone
*/

let _Colors2DArray = null, _Texture2DArray = null, _Normal2DArray = null, _textures = [], _normals = [];
let _mesh = null, _material = null;
let _ChangeBiomes = false, _size = null;
let _TextureAtlasCanvas = document.createElement('canvas'), _NormalAtlasCanvas = document.createElement('canvas');

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

                shader.uniforms.colorArray = {value: _Colors2DArray};
                shader.uniforms.textureArray = {value: _Texture2DArray};
                shader.uniforms.normalArray = {value: _Normal2DArray};

                shader.vertexShader = `out vec2 vUv;\n${shader.vertexShader}`;//  + shader.vertexShader;

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    [
                        '#include <begin_vertex>',
                        'vUv = uv;',
                        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                    ].join('\n')
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <normalmap_pars_fragment>',
                    [
                        'precision highp sampler2DArray;',
                        //'precision highp float;',
                        //'precision highp int;',
                        'in vec2 vUv;',
                        'uniform sampler2DArray colorArray;',
                        'uniform sampler2DArray textureArray;',
                        'uniform sampler2DArray normalArray;',
                        //normal scale ?

                        'vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN ) {',

                            // Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988
                    
                        '    vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );',
                        '    vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );',
                        '    vec2 st0 = dFdx( vUv.st );',
                        '    vec2 st1 = dFdy( vUv.st );',
                    
                        '    float scale = sign( st1.t * st0.s - st0.t * st1.s );', // we do not care about the magnitude
                    
                        '    vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );',
                        '    vec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );',
                        '    vec3 N = normalize( surf_norm );',
                    
                        '    mat3 tsn = mat3( S, T, N );',
                    
                        '    mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );',
                    
                        '    return normalize( tsn * mapN );',
                    
                        '}',
                    ].join('\n')
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <map_fragment>',
                    [
                        //'#include <map_fragment>',

                        'float _repeat = 10.0;',

                        'vec4 _color = texture(colorArray, vec3(vUv, 0.0));                     //getCoord(0, 5)',
                        'vec4 _texture = texture(textureArray, vec3(vUv * _repeat, 0.0));',
                        'vec4 _mix = mix(_texture, vec4(0.0, 0.0, 0.0, 0.0), _color.r);',
                        '_texture = texture(textureArray , vec3(vUv * _repeat, 1.0));',
                        '_mix = mix(_texture, _mix, _color.g);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 2.0));',
                        '_mix = mix(_texture, _mix, _color.b);',

                        '_color = texture(colorArray, vec3(vUv, 1.0));',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 3.0));',
                        '_mix = mix(_texture, _mix, _color.r);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 4.0));',
                        '_mix = mix(_texture, _mix, _color.g);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 5.0));',
                        '_mix = mix(_texture, _mix, _color.b);',

                        '_color = texture(colorArray, vec3(vUv, 2.0));',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 6.0));',
                        '_mix = mix(_texture, _mix, _color.r);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 7.0));',
                        '_mix = mix(_texture, _mix, _color.g);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 8.0));',
                        '_mix = mix(_texture, _mix, _color.b);',

                        '_color = texture(colorArray, vec3(vUv, 3.0));',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 9.0));',
                        '_mix = mix(_texture, _mix, _color.r);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 10.0));',
                        '_mix = mix(_texture, _mix, _color.g);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 11.0));',
                        '_mix = mix(_texture, _mix, _color.b);',

                        '_color = texture(colorArray, vec3(vUv, 4.0));',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 12.0));',
                        '_mix = mix(_texture, _mix, _color.r);',
                        '_texture = texture(textureArray, vec3(vUv * _repeat, 13.0));',
                        '_mix = mix(_texture, _mix, _color.g);',

                        'diffuseColor *= _mix;'
                    ].join('\n')
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <normal_fragment_maps>',
                    [
                        'vec4 _mapN = texture(normalArray, vec3(vUv * _repeat, 0.0));',
                        '_color = texture(colorArray, vec3(vUv, 0.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, vec4(0.0, 0.0, 0.0, 0.0), _color.r);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 1.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.g);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 2.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.b);',

                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 3.0));',
                        '_color = texture(colorArray, vec3(vUv, 1.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.r);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 4.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.g);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 5.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.b);',

                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 6.0));',
                        '_color = texture(colorArray, vec3(vUv, 2.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.r);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 7.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.g);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 8.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.b);',

                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 9.0));',
                        '_color = texture(colorArray, vec3(vUv, 3.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.r);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 10.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.g);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 11.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.b);',

                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 12.0));',
                        '_color = texture(colorArray, vec3(vUv, 4.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.r);',
                        '_mapN = texture(normalArray, vec3(vUv * _repeat, 13.0));',
                        '_mapN.xyz = _mapN.xyz * 2.0 - 1.0;',
                        '_mix = mix(_mapN, _mix, _color.g);',

                        'normal = perturbNormal2Arb( -vViewPosition, normal, _mix.xyz);',
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