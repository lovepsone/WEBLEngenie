/*
* author lovepsone
*/
let _mesh = null, _pressure = null, _scope = null, _ImageLoader = null;
let _depth = 64, _width = 64;
let _spacingX = 2, _heightOffset = 2.5, _spacingZ = 2;
let _context;

import {PressureTerrain} from './PressureTerrain.js';

class Terrain {

	constructor(scope) {

		_scope = scope;
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
    	let geometry = new THREE.Geometry;

        for (let x = 0; x < _depth; x++) {

            for (let z = 0; z < _width; z++) {

                let vertex = new THREE.Vector3(x * _spacingX, pixel.data[z * 4 + (_depth * x * 4)] / _heightOffset, z * _spacingZ);
                geometry.vertices.push(vertex);
            }
        }

        for (let z = 0; z < _depth - 1; z++) {
			
			for (let x = 0; x < _width - 1; x++) {
				  
				//let a = x + z * _width;
				//let b = (x + 1) + (z * _width);
				//let c = x + ((z + 1) * _width);
				//let d = (x + 1) + ((z + 1) * _width);
				let face1 = new THREE.Face3((x + z * _width), ((x + 1) + (z * _width)), ((x + 1) + ((z + 1) * _width)));
				let face2 = new THREE.Face3(((x + 1) + ((z + 1) * _width)), (x + ((z + 1) * _width)), (x + z * _width));
				geometry.faces.push(face1);
				geometry.faces.push(face2);
            }
        }

        geometry.computeVertexNormals(true);
        geometry.computeFaceNormals();
        geometry.computeBoundingBox();
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-geometry.boundingBox.max.x /2, 0, -geometry.boundingBox.max.z/2));
			
		let bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

		_mesh = new THREE.Mesh(bufferGeometry, new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide, morphTargets: true}));
		_mesh.add(new THREE.Mesh(bufferGeometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true})));

		_scope.scene.add(_mesh);
			
		_pressure = new PressureTerrain(_scope.camera, _mesh, 'Window');
		_pressure.AddEvents();
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