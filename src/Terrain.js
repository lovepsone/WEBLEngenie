/*
* author lovepsone
*/

import {PressureTerrain} from './PressureTerrain.js';

class Terrain {

	constructor() {

		this.mesh = null;
		this.pressure = null; 
	}

	CreateTerrain(_width, _height, _scene, _camera) {

		if (this.mesh != null) {

			_scene.remove(this.mesh);
		}

		var geometry = new THREE.PlaneBufferGeometry(_width, _height, _width, _height);
		var material = new THREE.MeshBasicMaterial({color: 0x0000ff, /*wireframe: true,*/ side: THREE.DoubleSide, morphTargets: true});

		var WireframeMaterial = new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.3, wireframe: true, transparent: true });

		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.name = 'Terrain';

		var WireframeMesh = new THREE.Mesh(geometry, WireframeMaterial);
		this.mesh.add(WireframeMesh);

		_scene.add(this.mesh);

		this.pressure = new PressureTerrain(_camera, this.mesh, 'Window');
		_camera.lookAt(this.mesh.position);

	}
}

export {Terrain};