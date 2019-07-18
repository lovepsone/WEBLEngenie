/*
* author lovepsone
*/
let _mesh = null, _pressure = null, _scope = null, _ImageLoader = null;
let _depth = 64, _width = 64;
let _spacingX = 2, _heightOffset = 2.5, _spacingZ = 2;
let _context;
let _worker = null;

import {PressureTerrain} from './PressureTerrain.js';

class Terrain {

	constructor(scope) {

		_scope = scope;
		_worker = new Worker('./src/WorkerHeightMap.js');
		_worker.onmessage = this.WorkerOnMessage;
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

		_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x0000ff, /*wireframe: true,*/ side: THREE.DoubleSide/*, morphTargets: true*/}));
		_mesh.name = 'Terrain';
		_mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true })));

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

		let buffVertices = e.data[0], buffNormals = e.data[1];
		let geometry = new THREE.BufferGeometry();
		let positions = new Float32Array(buffVertices.length * 3);
		let normals = new Float32Array(buffNormals.length * 3);

		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).copyVector3sArray(buffVertices));
		geometry.addAttribute( 'normal', new THREE.BufferAttribute(normals, 3).copyVector3sArray(buffNormals));
		geometry.computeBoundingBox();
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-geometry.boundingBox.max.x /2, 0, -geometry.boundingBox.max.z/2));

		_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide, morphTargets: true}));
		_mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true})));

		_scope.scene.add(_mesh);

		//_pressure = new PressureTerrain(_scope.camera, _mesh, 'Window');
		//_pressure.AddEvents();
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