/*
* author lovepsone
* generator height map https://tangrams.github.io/heightmapper
*/
let _mesh = null, _scope = null, _pixel = null, _context = null, _hNoise = null;
let _max = 0.0, _min = 0.0, _size = 1, _roughness = 2;

let _Optons  = {pressure: null, biomes: null, biomeMap: null, road: null, texture: null, isHeightMap: false};

import * as THREE from './../libs/three.module.js';
import {PressureTerrain} from './PressureTerrain.js';
import {Biomes} from './Biomes.js';
import {GenerateBiomeMap} from './GenerateBiomeMap.js';
import {Road} from './Road.js';
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree} from './../libs/BVH/index.js';
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
			_scope.scene.remove(_mesh);
			_mesh = null;
			_Optons.pressure.DisposeEvents();
			_Optons.road.DisposeEvents();
			_max = 0.0;
			_min = 0.0;
			_Optons.road.Remove();
			_Optons.texture.clear();
		}

		_Optons.isHeightMap = false;
		_size = size;

		_Optons.biomes.setSize(_size, _size);
		_Optons.biomes.setTypePixels(0);

		let geometry = new THREE.PlaneBufferGeometry(_size, _size, _size - 1, _size - 1);
		geometry.type = 'BufferGeometry';
		geometry.rotateX(-Math.PI / 2);
		geometry.computeBoundingBox();
		geometry.center();
		//geometry.computeFaceNormals();

		let colors = [];

		for (let i = 0, n = geometry.attributes.position.count; i < n; ++ i) {

			colors[i * 3] = 0;
			colors[i * 3 + 1] = 0;
			colors[i * 3 + 2] = 1;
		}

		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geometry.attributes.color.needsUpdate = true;

		_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: THREE.VertexColors}));
		_mesh.name = 'Terrain';
		_mesh.geometry.computeBoundsTree();
		_scope.scene.add(_mesh);

		_Optons.pressure.setTerrain(_mesh);
		_Optons.pressure.AddEvents();

		_Optons.biomeMap.setSize(_size, _size);
		_Optons.biomeMap.setTerrain(_mesh);
		_Optons.biomeMap.AddEvents();
		_Optons.biomeMap.DisposeEvents();

		_Optons.road.setTerrain(_mesh);
		_Optons.road.AddEvents();
		_Optons.road.DisposeEvents();

		_Optons.texture.setTerrain(_mesh);
	}

	LoadHeightMap(image) {

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
		this.ApplyHeightMap();
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

		for (let i = 0, n = _mesh.geometry.attributes.position.count; i < n; ++ i) {

			const tmp = (_pixel.data[i * 4] + _pixel.data[i * 4 + 1] + _pixel.data[i * 4 + 2]) / _roughness;
			_mesh.geometry.attributes.position.array[i * 3 + 1] = (tmp / 255) * 50;
			_mesh.geometry.attributes.position.needsUpdate = true;
		}

		_mesh.geometry.computeVertexNormals();
		_mesh.geometry.normalizeNormals();
		_mesh.geometry.computeBoundsTree();
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
		_Optons.biomeMap.setColorsDataBiomes(_mesh.geometry.attributes.color);
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

		for (let i = 0; i < _mesh.geometry.attributes.position.count; i++) {

			if (_max < _mesh.geometry.attributes.position.array[i * 3 + 1]) _max = _mesh.geometry.attributes.position.array[i * 3 + 1];
			if (_min > _mesh.geometry.attributes.position.array[i * 3 + 1]) _min = _mesh.geometry.attributes.position.array[i * 3 + 1];
		}

		/* fix ?
		_mesh.geometry.computeBoundingBox();
		_max = _mesh.geometry.boundingBox.max.y;
		_min = _mesh.geometry.boundingBox.min.y;*/

		for (let i = 0; i < _mesh.geometry.attributes.position.count; i++) {

			const bufcolor =  new THREE.Color().fromArray(_mesh.geometry.attributes.color.array, i * 3);

			if (
				Math.fround(_mesh.geometry.attributes.color.array[i * 3]) == Math.fround(cBoard.r) &&
				Math.fround(_mesh.geometry.attributes.color.array[i * 3 + 1]) == Math.fround(cBoard.g) &&
				Math.fround(_mesh.geometry.attributes.color.array[i * 3 + 2]) == Math.fround(cBoard.b)
			) continue;
			const y = _mesh.geometry.attributes.position.array[i * 3 + 1];
			const height = (y - _min) / (_max - _min);

			const color = new THREE.Color(_Optons.biomes.get(height, i));

			_mesh.geometry.attributes.color.array[i * 3] = color.r;
			_mesh.geometry.attributes.color.array[i * 3 + 1] = color.g;
			_mesh.geometry.attributes.color.array[i * 3 + 2] = color.b;
		}

		_mesh.geometry.attributes.color.needsUpdate = true;
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

	WireFrame(value = true) {

		if (_mesh instanceof THREE.Mesh) {

			_mesh.material.wireframe = value;
		}
	}

	setDefaultMaterial(wireframe) {

		if (_mesh instanceof THREE.Mesh) {

			_mesh.material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: THREE.VertexColors, wireframe: wireframe});
			_mesh.material.needsUpdate = true;
		}
	}

	getMesh() {

		if (_mesh instanceof THREE.Mesh) {

			return _mesh;
		}
		console.error('Terrain.js: mesh was not created !!!')
	}
}

export {Terrain};