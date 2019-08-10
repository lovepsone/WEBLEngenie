/*
* author lovepsone
*/
let _mesh = null, _pressure = null, _biomes = null, _scope = null, _ImageLoader = null;
let _depth = 64, _width = 64;
let _context;
let _max = 0.0, _min = 0.0;

import {PressureTerrain} from './PressureTerrain.js';
import {Biomes} from './Biomes.js';
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree} from './../libs/BVH/index.js';

THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

class Terrain {

	constructor(scope) {

		_scope = scope;
		_biomes = new Biomes();
	}

	Create(_width, _height) {

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(_mesh);
			_mesh = null;
			_pressure.DisposeEvents();
			_pressure.WorkerStop();
			_pressure = null;
			_max = 0.0;
			_min = 0.0;
		}

		_biomes.setSize(_width, _height);
		_biomes.setTypePixels(0);

		let geometry = new THREE.PlaneBufferGeometry(_width, _height, _width, _height);
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
	
		geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geometry.attributes.color.needsUpdate = true;

		_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: THREE.VertexColors}));
		_mesh.name = 'Terrain';
		_mesh.geometry.computeBoundsTree();
		_scope.scene.add(_mesh);

		_pressure = new PressureTerrain(_scope.camera, _mesh, 'Window');
		_scope.scene.add(_pressure.getBrush());
		_pressure.AddEvents();
	}

	LoadHeightMap(image, width = 128, depth = 128) {

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(_mesh);
			_mesh = null;
			_pressure.DisposeEvents();
			_pressure.WorkerStop();
			_pressure = null;
			_max = 0.0;
			_min = 0.0;
		}

		_depth = depth;
		_width = width;

		_biomes.setSize(_width, _depth);
		_biomes.setTypePixels(0);

		let canvas = document.createElement('canvas');
		canvas.width = _width;
		canvas.height = _depth;
		_context = canvas.getContext('2d');

		_context.drawImage(image, 0, 0);
		let pixel = _context.getImageData(0, 0, _width, _depth);

		let DataHeight = [], colors = [];
		
		for (let i = 0, n = pixel.data.length; i < n; i += 4) {
			
			DataHeight.push((pixel.data[i] + pixel.data[i+1] + pixel.data[i+2]) / 3);
		}

		let geometry = new THREE.PlaneBufferGeometry(_width, _depth, _width - 1, _depth - 1);
		geometry.rotateX(-Math.PI / 2);
		geometry.computeBoundingBox();
		geometry.center();
		geometry.computeFaceNormals();

		for (let i = 0, n = geometry.attributes.position.count; i < n; ++ i) {

			geometry.attributes.position.array[i*3 + 1] += (DataHeight[i] / 255) * 50;
			colors[i * 3] = 0;
			colors[i * 3 + 1] = 0;
			colors[i * 3 + 2] = 1;
		}

		geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geometry.attributes.color.needsUpdate = true;
		geometry.attributes.position.needsUpdate = true;

		_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: THREE.VertexColors}));
		_mesh.name = 'Terrain';
		_mesh.geometry.computeBoundsTree();
		_scope.scene.add(_mesh);
	
		_pressure = new PressureTerrain(_scope.camera, _mesh, 'Window');
		_scope.scene.add(_pressure.getBrush());
		_pressure.AddEvents();
	}

	getBiomes() {

		return _biomes;
	}

	ApplyBiomes() {

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
	}

	WireFrame(value = true) {

		if (_mesh instanceof THREE.Mesh) {

			_mesh.material.wireframe = value;
		}
	}

	setPressureRadius(r) {

		if (_pressure instanceof PressureTerrain) {

			_pressure.UpdateRadius(r);
		}
	}


	setPressureStrength(s) {

		if (_pressure instanceof PressureTerrain) {

			_pressure.UpdateStrength(s);
		}
	}

	PressureDisposeEvents() {

		if (_pressure instanceof PressureTerrain) {

			_pressure.DisposeEvents();
		}
	}

	PressureUpdateEvents() {

		if (_pressure instanceof PressureTerrain) {

			_pressure.AddEvents();
		}
	}
}

export {Terrain};