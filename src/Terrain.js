/*
* author lovepsone
*/
let _mesh = null, _pressure = null, _biomes = null, _scope = null, _ImageLoader = null;
let _depth = 64, _width = 64;
let _spacingX = 2, _heightOffset = 2.5, _spacingZ = 2;
let _context;
let _worker = null;

let max = 0.0, min = 0.0, center = 0.0;

import {PressureTerrain} from './PressureTerrain.js';
import {Biomes} from './Biomes.js';

function updateAttrColor(attr, color, current) {

	attr.array[current * 3] = color.r;
	attr.array[current * 3 + 1] = color.g;
	attr.array[current * 3 + 2] = color.b;
}

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

		}

		_biomes.setSize(_width, _height);

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
		//_mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true })));

		_scope.scene.add(_mesh);

		_pressure = new PressureTerrain(_scope.camera, _mesh, 'Window');
		_pressure.AddEvents();
	}

	LoadHeightMap(image, depth = 128, width = 128) {

		_worker = new Worker('./src/WorkerHeightMap.js');
		_worker.onmessage = this.WorkerOnMessage;

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(_mesh);
			_mesh = null;
			_pressure.DisposeEvents();
			_pressure.WorkerStop();
			_pressure = null;
		}

		_depth = depth;
		_width = width;

		_biomes.setSize(_width, _depth);
		let canvas = document.createElement('canvas');
		canvas.width = _width;
		canvas.height = _depth;
		_context = canvas.getContext('2d');

		_context.drawImage(image, 0, 0);
		let pixel = _context.getImageData(0, 0, _width, _depth);
		
		_worker.postMessage({'cmd': 'pixels', 'data': pixel, 'size': _width, 'spacingXZ':[_spacingX, _spacingZ], 'heightOffset': _heightOffset});
	}

	getBiomes() {

		return _biomes;
	}

	WorkerOnMessage(e) {

		switch(e.data.cmd) {

			case 'onLoadData': {

				let buffVertices = e.data.points, buffNormals = e.data.normals, buffColors = e.data.colors;

				max =  e.data.max;
				min = e.data.min;
				center = max /2;	// min = 0 в данном случаи

				let geometry = new THREE.BufferGeometry();
				let positions = new Float32Array(buffVertices.length * 3);
				let normals = new Float32Array(buffNormals.length * 3);

				geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).copyVector3sArray(buffVertices));
				geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3).copyVector3sArray(buffNormals));
				geometry.addAttribute('color', new THREE.Float32BufferAttribute(buffColors, 3));


				for (let i = 0; i < geometry.attributes.position.count; i++) {

					let y = geometry.attributes.position.array[i * 3 + 1];
					let h = (y - min) / (max - min);
					let m =  Math.round(i / 6);
					updateAttrColor(geometry.attributes.color, new THREE.Color(_biomes.get(h,m ))/*biomeColor(biome(h, m))*/, i);

					geometry.attributes.color.needsUpdate = true;
				}

				geometry.computeBoundingBox();
				geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-geometry.boundingBox.max.x /2, 0, -geometry.boundingBox.max.z/2));

				_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: THREE.VertexColors}));
				//_mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true})));
				_mesh.name = 'Terrain';
				_scope.scene.add(_mesh);

				_pressure = new PressureTerrain(_scope.camera, _mesh, 'Window');
				_pressure.AddEvents();

				_worker.postMessage({'cmd': 'stop'});
				_worker = null;
			}
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