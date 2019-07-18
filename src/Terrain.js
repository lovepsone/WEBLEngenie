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

		let geometry = new THREE.BufferGeometry(), position = [], index = [];
		// преобразовыем пиксели в вертекси и фейсы
		let faces = [], vertices = [];
		let buffVertices = [], buffNormals = [];
	
        for (let x = 0; x < _depth; x++) {

            for (let z = 0; z < _width; z++) {

                let vertex = new THREE.Vector3(x * _spacingX, pixel.data[z * 4 + (_depth * x * 4)] / _heightOffset, z * _spacingZ);
                vertices.push(vertex);
            }
		}
		
        for (let z = 0; z < _depth - 1; z++) {
			
			for (let x = 0; x < _width - 1; x++) {

				faces.push(new THREE.Face3((x + z * _width), ((x + 1) + (z * _width)), ((x + 1) + ((z + 1) * _width))));
				faces.push(new THREE.Face3(((x + 1) + ((z + 1) * _width)), (x + ((z + 1) * _width)), (x + z * _width)));
            }
		}
		// преобразование в буфферную сетку 
		for(let i = 0; i < faces.length; i ++) {

			let face = faces[i];
			buffVertices.push(vertices[face.a], vertices[face.b], vertices[face.c]);
			let vertexNormals = face.vertexNormals;

			if (vertexNormals.length === 3) {

				buffNormals.push(vertexNormals[0], vertexNormals[1], vertexNormals[2]);
			} else {

				let normal = face.normal;
				buffNormals.push(normal, normal, normal);
			}
		}

		let positions = new Float32Array(buffVertices.length * 3);
		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).copyVector3sArray(buffVertices));

		let normals = new Float32Array(buffNormals.length * 3);
		geometry.addAttribute( 'normal', new THREE.BufferAttribute(normals, 3).copyVector3sArray(buffNormals));
		geometry.computeBoundingBox();
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-geometry.boundingBox.max.x /2, 0, -geometry.boundingBox.max.z/2));

		_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide, morphTargets: true}));
		_mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true})));

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