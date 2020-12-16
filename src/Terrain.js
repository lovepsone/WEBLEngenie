/*
* author lovepsone
*/
let _mesh = null, _scope = null, _pixel = null, _context = null;
let _max = 0.0, _min = 0.0, _size = 1, _roughness = 2;

let _Optons  = {pressure: null, biomes: null, biomeMap: null, road: null, texture: null, isHeightMap: false};

import * as THREE from './../libs/three.module.js';
import {PressureTerrain} from './PressureTerrain.js';
import {Biomes} from './Biomes.js';
import {GenerateBiomeMap} from './GenerateBiomeMap.js';
import {Road} from './Road.js';
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree} from './../libs/BVH/index.js';
import {TextureAtlas} from './TextureAtlas.js';

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
	}

	Create(size) {

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(_mesh);
			_mesh = null;
			_Optons.pressure.DisposeEvents();
			_Optons.road.DisposeEvents();
			_max = 0.0;
			_min = 0.0;
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
		geometry.computeFaceNormals();

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

		_mesh.geometry.computeBoundsTree();
	}

	setRoughness(val) {

		_roughness = val;
		this.ApplyHeightMap();
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

			let y = _mesh.geometry.attributes.position.array[i * 3 + 1];
			let height = (y - _min) / (_max - _min);

			let color = new THREE.Color(_Optons.biomes.get(height, i));
	
			_mesh.geometry.attributes.color.array[i * 3] = color.r;
			_mesh.geometry.attributes.color.array[i * 3 + 1] = color.g;
			_mesh.geometry.attributes.color.array[i * 3 + 2] = color.b;

		}

		_mesh.geometry.attributes.color.needsUpdate = true;
		this.UpdateDataColors();
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