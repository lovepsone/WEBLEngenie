/*
* @author lovepsone 2019 - 2023
* generator height map https://tangrams.github.io/heightmapper
*/
let _mesh = null, _scope = null, _pixel = null, _context = null, _hNoise = null;
let _max = 0.0, _min = 0.0, _size = 1, _roughness = 40;

let _Optons  = {pressure: null, biomes: null, biomeMap: null, road: null, texture: null, isHeightMap: false};

import * as THREE from './../libs/three.module.js';
//import {BufferGeometryUtils} from './../libs/BufferGeometryUtils.js';
import {PressureTerrain} from './PressureTerrain.js';
import {Biomes} from './Biomes.js';
import {GenerateBiomeMap} from './GenerateBiomeMap.js';
import {Road} from './Road.js';
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree, CONTAINED, INTERSECTED, NOT_INTERSECTED, MeshBVHVisualizer,} from './../libs/BVH.module.js';
import {TextureAtlas} from './TextureAtlas.js';
import {COLORBOARDROAD} from './CONST.js';
import {DrawNoise} from './DrawNoise.js';

THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

class Terrain {

	constructor(scope) {

		_scope = scope;

		_Optons.biomes = new Biomes();
		_Optons.road = new Road(_scope.camera, 'Window', _scope.scene);
		_Optons.pressure = new PressureTerrain(_scope.camera, 'Window', _scope.scene);
		_Optons.biomeMap = new GenerateBiomeMap(_scope.camera, 'Window', _scope.scene);
		_Optons.texture = new TextureAtlas();
		_hNoise = new DrawNoise(128, 128, 'HeightMapNoise', false);
	}

	Create(size) {

		if (_mesh instanceof THREE.Mesh) {

			_mesh.geometry.dispose();
			_Optons.pressure.DisposeEvents();
			_Optons.road.DisposeEvents();
			_Optons.biomeMap.DisposeEvents();
			_scope.scene.remove(_mesh);
			_mesh = null;
			_max = 0.0;
			_min = 0.0;
			_Optons.road.RemoveAll();
			_Optons.texture.clear();
			_size = 1;
		}

		_Optons.isHeightMap = false;
		_size = Number(size);

		_Optons.biomes.setSize(_size, _size);
		_Optons.biomes.setTypePixels(0);

		let geometry = new THREE.PlaneGeometry(_size, _size, _size - 1, _size - 1);
		//geometry.type = 'BufferGeometry';
		geometry.rotateX(-Math.PI / 2);
		geometry.computeBoundingBox();
		geometry.center();
		//geometry.computeFaceNormals();

		let colors = [];

		for (let i = 0, n = geometry.getAttribute('position').count; i < n; ++ i) {

			colors[i * 3] = 0;
			colors[i * 3 + 1] = 0;
			colors[i * 3 + 2] = 1;
		}

		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geometry.getAttribute('color').needsUpdate = true;

		_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: true}));
		_mesh.name = 'Terrain';
		//_mesh.geometry.computeBoundsTree();
		_scope.scene.add(_mesh);

		_Optons.pressure.setTerrain(_mesh);
		_Optons.pressure.AddEvents();
		_Optons.pressure.DisposeEvents();

		_Optons.biomeMap.setSize(_size, _size);
		_Optons.biomeMap.setTerrain(_mesh);
		_Optons.biomeMap.AddEvents();
		_Optons.biomeMap.DisposeEvents();

		_Optons.road.setTerrain(_mesh);
		_Optons.road.AddEvents();
		_Optons.road.DisposeEvents();

		_Optons.texture.setTerrain(_mesh);
	}

	ApplyNormalMapToHeight() {

		if (!(_mesh instanceof THREE.Mesh)) {

			console.warn('Terrain.js: create a terrain before doing this.');
			return;
		}

		if (!_Optons.isHeightMap) {

			console.warn('Terrain.js: heightmap was not loaded.');
			return;
		}

		const dxdy = [], invSize =  1.0 / _size;
		let result = [], current = [];

		for (let i = 0; i < _pixel.data.length; i += 4) {

			const x = _pixel.data[i];
			const y = _pixel.data[i + 1];
			const z = _pixel.data[i + 2];
			const dx =  -x / z;
			const dy =  -y/ z;

			//dxdy.push({x: dx * invSize, y: dy * invSize});
			dxdy.push({x: dx * 16 , y: dy * 16});
			result.push(0);
			current.push(0);
		}

		const numIterations = 1000;

		for (let i = 0; i < numIterations; i++) {

			for (let row = 0; row < _size; row++) {

				const up = this.Wrap(row - 1, _size);
				const down = this.Wrap(row + 1, _size);

				for (let col = 0; col < _size; col++) {

					const left = this.Wrap(col - 1, _size);
					const right = this.Wrap(col + 1, _size);

					let h = 0;
					h += current[left  + row  * _size]  + 0.5 * dxdy[row * _size + left].x;
					h += current[right + row  * _size]  - 0.5 * dxdy[row * _size + right].x;
					h += current[col   + up   * _size]  + 0.5 * dxdy[up * _size +  col].y;
					h += current[col   + down * _size]  - 0.5 * dxdy[down * _size +  col].y;
					result[col + row * _size] = h / 4;
				}
			}

			current = result;
		}
		console.log(dxdy);
		for (let i = 0, n = _mesh.geometry.getAttribute('position').count; i < n; ++ i) {

			//if (_roughness  == 0) _roughness = 1;
			//const tmp = (_pixel.data[i * 4] + _pixel.data[i * 4 + 1] + _pixel.data[i * 4 + 2]) / 3;
			_mesh.geometry.getAttribute('position').setY(i,  (result[i] / 255) * _roughness);
		}
		_mesh.geometry.getAttribute('position').needsUpdate = true;
		_mesh.geometry.computeVertexNormals();
		_mesh.geometry.normalizeNormals();
		_mesh.geometry.computeBoundsTree();
	}

	Wrap(v, maxVal) {

		if ( v < 0 ) return v + maxVal;
		else if ( v >= maxVal ) return 0;
		else return v;
	}

	LoadHeightMap(image, isNormalMap = true) {

		if (!(_mesh instanceof THREE.Mesh)) {

			console.warn('Terrain.js: create a terrain before doing this.');
			return;
		}

		let canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		_context = canvas.getContext('2d');

		_context.drawImage(image, 0, 0);
		_pixel = null;
		_pixel = _context.getImageData(0, 0, image.width, image.height);
		_Optons.isHeightMap = true;

		if (isNormalMap) {

			this.ApplyNormalMapToHeight();
		} else {

			this.ApplyHeightMap();
		}
	}

	ApplyHeightMap() {

		if (!(_mesh instanceof THREE.Mesh)) {

			console.warn('Terrain.js: create a terrain before doing this.');
			return;
		}

		if (!_Optons.isHeightMap) {

			console.warn('Terrain.js: heightmap was not loaded.');
			return;
		}

		for (let i = 0, n = _mesh.geometry.getAttribute('position').count; i < n; ++ i) {

			if (_roughness  == 0) _roughness = 1;
			const tmp = (_pixel.data[i * 4] + _pixel.data[i * 4 + 1] + _pixel.data[i * 4 + 2]) / 3;
			_mesh.geometry.getAttribute('position').setY(i,  (tmp / 255) * _roughness);
		}

		_mesh.geometry.getAttribute('position').needsUpdate = true;
		_mesh.geometry.computeVertexNormals();
		_mesh.geometry.normalizeNormals();
		_mesh.geometry.computeBoundsTree();

		//BufferGeometryUtils.mergeVertices(_mesh.geometry); // is it necessary?
	}

	setRoughness(val, isApplyMap = true) {

		_roughness = val;
		if (isApplyMap) this.ApplyHeightMap();
	}

	UpdateDataColors() {

		if (!(_mesh instanceof THREE.Mesh)) {

			console.warn('Terrain.js: create a terrain before doing this.');
			return;
		}
		_Optons.biomeMap.setColorsDataBiomes(_mesh.geometry.getAttribute('color'));
	}

	getOptions() {

		return _Optons;
	}

	getSize() {

		return _size;
	}

	ApplyBiomes() {

		const cBoard = new THREE.Color(COLORBOARDROAD);

		if (!(_mesh instanceof THREE.Mesh)) {

			console.warn('Terrain.js: Create geometry before overlaying biome.');
			return;
		}

		for (let i = 0; i < _mesh.geometry.getAttribute('position').count; i++) {

			if (_max < _mesh.geometry.getAttribute('position').getY(i)) _max = _mesh.geometry.getAttribute('position').getY(i);
			if (_min > _mesh.geometry.getAttribute('position').getY(i)) _min = _mesh.geometry.getAttribute('position').getY(i);
		}

		/* fix ?
		_mesh.geometry.computeBoundingBox();
		_max = _mesh.geometry.boundingBox.max.y;
		_min = _mesh.geometry.boundingBox.min.y;*/

		for (let i = 0; i < _mesh.geometry.getAttribute('position').count; i++) {

			const bufcolor =  new THREE.Color().fromArray(_mesh.geometry.attributes.color.array, i * 3);

			if (
				Math.fround(_mesh.geometry.getAttribute('color').getX(i)) == Math.fround(cBoard.r) &&
				Math.fround(_mesh.geometry.getAttribute('color').getY(i)) == Math.fround(cBoard.g) &&
				Math.fround(_mesh.geometry.getAttribute('color').getZ(i)) == Math.fround(cBoard.b)
			) continue;
			const y = _mesh.geometry.getAttribute('position').getY(i);
			const height = (y - _min) / (_max - _min);

			const color = new THREE.Color(_Optons.biomes.get(height, i));
			_mesh.geometry.getAttribute('color').setXYZ(i, color.r, color.g, color.b);
		}

		_mesh.geometry.getAttribute('color').needsUpdate = true;
		this.UpdateDataColors();
	}

	ApplyNoise(colors) {

        for (let i = 0; i < _size; i++) {

            for (let j = 0; j < _size; j++) {

                _hNoise.setMatrix(i, j, colors[i][j]);
            }
		}
		_pixel = _hNoise.getContext().getImageData(0, 0, _size, _size);
		_Optons.isHeightMap = true;
		this.ApplyHeightMap();
	}

	Smoothing() {

		const count = _mesh.geometry.getAttribute('position').count - _size - 1;

		for (let i = _size; i < count; i++) {

			const l = i % _size;

			if (i % _size != 0 && l != (_size - 1)) {

				const a = _mesh.geometry.getAttribute('position').getY(i);
				const b = _mesh.geometry.getAttribute('position').getY(i - 1)
				const c = _mesh.geometry.getAttribute('position').getY(i + 1);
				_mesh.geometry.getAttribute('position').setY(i, 0.5 * (0.5 * (b + c) + a));

				if (i < _size * 2) {

					for (let j = i; j < count; j += _size) {

						const aa = _mesh.geometry.getAttribute('position').getY(j);
						const bb = _mesh.geometry.getAttribute('position').getY(j - _size);
						const cc = _mesh.geometry.getAttribute('position').getY(j + _size);
						_mesh.geometry.getAttribute('position').setY(j, 0.5 * (0.5 * (bb + cc) + aa));
					}
				}
			}
		}

		_mesh.geometry.getAttribute('position').needsUpdate = true;
	}

	WireFrame(value = true) {

		if (_mesh instanceof THREE.Mesh) {

			_mesh.material.wireframe = value;
		}
	}

	setDefaultMaterial(wireframe) {

		if (_mesh instanceof THREE.Mesh) {

			_mesh.material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: true, wireframe: wireframe});
			_mesh.material.needsUpdate = true;
		}
	}

	getMesh() {

		if (_mesh instanceof THREE.Mesh) {

			return _mesh;
		}

		console.warn('Terrain.js: mesh was not created !!!');
		return 0;
	}
}

export {Terrain};