/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';

let controls;

class MainEngenie {

	constructor(c_fov, c_Width, c_Height) {

		this.renderer = new THREE.WebGLRenderer({antialias:true});
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.001, 9000);
		this.scene = new THREE.Scene();
		// renderer settings
		this.renderer.setClearColor(0x808080);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		controls = new CameraControls(this.camera, 'Window');
		this.camera.position.set(0, -25, 30);
		this.terrain = new Terrain(this);
	}

	CreateObject(_width, _height) {

		this.terrain.Create(_width, _height);
	}

	Render() {

		this.renderer.render(this.scene, this.camera);
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

var AnimationFrame = function()
{
	requestAnimationFrame(AnimationFrame);
};

export {MainEngenie, AnimationFrame};
