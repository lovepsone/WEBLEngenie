/*
* author lovepsone
*/
let _mesh = null, _scope = null, _ImageLoader = null, _context = null;
let _max = 0.0, _min = 0.0, _size = 64;

let _Optons  = {pressure: null, biomes: null, biomeMap: null, road: null};

import * as THREE from './../libs/three/Three.js';
import {PressureTerrain} from './PressureTerrain.js';
import {Biomes} from './Biomes.js';
import {GenerateBiomeMap} from './GenerateBiomeMap.js';
import {Road} from './Road.js';
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree} from './../libs/BVH/index.js';

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
	}

	Create(size) {

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(_mesh);
			_mesh = null;
			_pressure.DisposeEvents();
			_road.DisposeEvents();
			_max = 0.0;
			_min = 0.0;
		}

		_size = size;

		_biomes.setSize(_size, _size);
		_biomes.setTypePixels(0);

		let geometry = new THREE.PlaneBufferGeometry(_size, _size, _size - 1, _size - 1);
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

		_pressure.setTerrain(_mesh);
		_pressure.AddEvents();

		_BiomeMap.setSize(_size, _size);
		_BiomeMap.setTerrain(_mesh);
		_BiomeMap.AddEvents();
		_BiomeMap.DisposeEvents();

		_road.setTerrain(_mesh);
		_road.AddEvents();
		_road.DisposeEvents();
	}

	LoadHeightMap(image) {

		let canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		_context = canvas.getContext('2d');

		_context.drawImage(image, 0, 0);
		let pixel = _context.getImageData(0, 0, image.width, image.height);

		let DataHeight = [];
		//let DataHeight = new Float32Array(image.width * image.height);

		for (let i = 0, n = pixel.data.length; i < n; i += 4) {
			
			DataHeight.push((pixel.data[i] + pixel.data[i+1] + pixel.data[i+2]) / 3);
		}

		for (let i = 0, n = _mesh.geometry.attributes.position.count; i < n; ++ i) {

			_mesh.geometry.attributes.position.array[i*3 + 1] += (DataHeight[i] / 255) * 50;
			_mesh.geometry.attributes.position.needsUpdate = true;
		}
	
		_mesh.geometry.computeBoundsTree();
	}

	getOptions() {

		return _Optons;
	}

	getSize() {

		return _size;
	}

	ApplyBiomes() { // перенести метод в биомы

		if (_mesh instanceof THREE.Mesh && _max == 0) {

			for (let i = 0; i < _mesh.geometry.attributes.position.count; i++) {

				if (_max < _mesh.geometry.attributes.position.array[i * 3 + 1]) _max = _mesh.geometry.attributes.position.array[i * 3 + 1];
				if (_min > _mesh.geometry.attributes.position.array[i * 3 + 1]) _min = _mesh.geometry.attributes.position.array[i * 3 + 1];
			}

		}

		if (_mesh instanceof THREE.Mesh && _max != 0.0) {

			for (let i = 0; i < _mesh.geometry.attributes.position.count; i++) {

				let y = _mesh.geometry.attributes.position.array[i * 3 + 1];
				let height = (y - _min) / (_max - _min);

				let color = new THREE.Color(_biomes.get(height, i));
	
				_mesh.geometry.attributes.color.array[i * 3] = color.r;
				_mesh.geometry.attributes.color.array[i * 3 + 1] = color.g;
				_mesh.geometry.attributes.color.array[i * 3 + 2] = color.b;
				_mesh.geometry.attributes.color.needsUpdate = true;
			}
		}

		_BiomeMap.setColorsDataBiomes(_mesh.geometry.attributes.color);
	}

	WireFrame(value = true) {

		if (_mesh instanceof THREE.Mesh) {

			_mesh.material.wireframe = value;
		}
	}
}

export {Terrain};