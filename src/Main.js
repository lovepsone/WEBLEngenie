/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';

let controls;

class MainEngenie {

	constructor(c_fov, c_Width, c_Height) {

		// renderer settings
		this.renderer = new THREE.WebGLRenderer({ antialias:true });
		this.renderer.setClearColor(0x808080);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.001, 9000);
		this.camera.position.set(0, 160, 100);
		this.scene = new THREE.Scene();

		var axesHelper = new THREE.AxesHelper(15);
		this.scene.add(axesHelper);
		this.camera.lookAt(axesHelper.position);

		controls = new CameraControls(this.camera, 'Window');
		this.terrain = new Terrain(this);

	}

	CreateObject(_width, _height) {

		this.terrain.Create(_width, _height);
	}

	Render() {

		this.renderer.render(this.scene, this.camera);
		this.camera.updateProjectionMatrix();
	}
	
	getRender() {

		return this.renderer;
	}

	getTerrain() {

		return this.terrain;
	}

	getControlsCamera() {

		return controls;
	}
}

export {MainEngenie};
