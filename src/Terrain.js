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

class Terrain {

	constructor(scope) {

		_scope = scope;

		_worker = new Worker('./src/WorkerHeightMap.js');
		_worker.onmessage = this.WorkerOnMessage;

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

			colors[i * 3 + 3] = 0;
			colors[i * 3 + 4] = 0;
			colors[i * 3 + 5] = 1;

			colors[i * 3 + 6] = 0;
			colors[i * 3 + 7] = 0;
			colors[i * 3 + 8] = 1;
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

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(_mesh);
			_mesh = null;
			_pressure.DisposeEvents();
			_pressure.WorkerStop();
			_pressure = null;
			//_worker.postMessage({'cmd':'stop'});

		}
		_depth = depth;
		_width = width;
		let canvas = document.createElement('canvas');
		canvas.width = _width;
		canvas.height = _depth;
		_context = canvas.getContext('2d');

		_context.drawImage(image, 0, 0);
		let pixel = _context.getImageData(0, 0, _width, _depth);
		
		_worker.postMessage({'cmd': 'pixels', 'data': pixel, 'size': _width, 'spacingXZ':[_spacingX, _spacingZ], 'heightOffset': _heightOffset});
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


				/*for (let i = 0; i < geometry.attributes.position.count; i++) {

					let m =  _noise[Math.round(i / 6)];
					let h = mapper(geometry.attributes.position.array[i * 3 + 1], min, max + 20);
					updateAttrColor(geometry.attributes.color, biomeColor(biome(h, m)), i);

					geometry.attributes.color.needsUpdate = true;
				}*/

				geometry.computeBoundingBox();
				geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-geometry.boundingBox.max.x /2, 0, -geometry.boundingBox.max.z/2));

				_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide, vertexColors: THREE.VertexColors}));
				//_mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true})));
				_mesh.name = 'Terrain';
				_scope.scene.add(_mesh);

				_pressure = new PressureTerrain(_scope.camera, _mesh, 'Window');
				_pressure.AddEvents();

				_worker.postMessage({'cmd': 'colors', 'points': geometry.attributes.position});
			}
		}
				
	}

	updateAttrColor(attr, color, current) {

		attr.array[current * 3] = color.r;
		attr.array[current * 3 + 1] = color.g;
		attr.array[current * 3 + 2] = color.b;
	
		attr.array[current * 3 + 3] = color.r;
		attr.array[current * 3 + 4] = color.g;
		attr.array[current * 3 + 5] = color.b;
	
		attr.array[current * 3 + 6] = color.r;
		attr.array[current * 3 + 7] = color.g;
		attr.array[current * 3 + 8] = color.b;
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