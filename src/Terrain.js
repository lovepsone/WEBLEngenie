/*
* author lovepsone
*/

var mesh = null, pressure = null;

import {PressureTerrain} from './PressureTerrain.js';

class Terrain {

	ScopeMain = null;

	constructor(scope) {

		this.ScopeMain = scope;
	}

	Create(_width, _height) {

		if (mesh != null) {

			this.ScopeMain.scene.remove(mesh);
		}

		let geometry = new THREE.PlaneBufferGeometry(_width, _height, _width, _height);

		mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x0000ff, /*wireframe: true,*/ side: THREE.DoubleSide, morphTargets: true}));
		mesh.name = 'Terrain';
		mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.3, wireframe: true, transparent: true })));

		this.ScopeMain.scene.add(mesh);

		pressure = new PressureTerrain(this.ScopeMain.camera, mesh, 'Window');
		pressure.AddEvents();
		this.ScopeMain.camera.lookAt(mesh.position);

	}

	setPressureRadius(r) {

		if (typeof(pressure) === 'object' && pressure !== null) {

			pressure.UpdateRadius(r);
		}
	}


	setPressureStrength(s) {

		if (typeof(pressure) === 'object' && pressure !== null) {

			pressure.UpdateStrength(s);
		}
	}

	PressureDisposeEvents() {

		if (typeof(pressure) === 'object' && pressure !== null) {

			pressure.DisposeEvents();
		}
	}

	PressureUpdateEvents() {

		if (typeof(pressure) === 'object' && pressure !== null) {

			pressure.AddEvents();
		}
	}	
}

export {Terrain};