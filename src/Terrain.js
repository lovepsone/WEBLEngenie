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
		mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true })));

		this.ScopeMain.scene.add(mesh);

		pressure = new PressureTerrain(this.ScopeMain.camera, mesh, 'Window');
		pressure.AddEvents();
		this.ScopeMain.camera.lookAt(mesh.position);

	}

	setPressureRadius(r) {

		if (pressure instanceof PressureTerrain) {

			pressure.UpdateRadius(r);
		}
	}


	setPressureStrength(s) {

		if (pressure instanceof PressureTerrain) {

			pressure.UpdateStrength(s);
		}
	}

	PressureDisposeEvents() {

		if (pressure instanceof PressureTerrain) {

			pressure.DisposeEvents();
		}
	}

	PressureUpdateEvents() {

		if (pressure instanceof PressureTerrain) {

			pressure.AddEvents();
		}
	}	
}

export {Terrain};