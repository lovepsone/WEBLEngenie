/*
* author lovepsone
*/
let _mesh = null, _pressure = null, _scope = null;

import {PressureTerrain} from './PressureTerrain.js';

class Terrain {

	constructor(scope) {

		_scope = scope;
	}

	Create(_width, _height) {

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(mesh);
			_mesh = null;
			_pressure.DisposeEvents();
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