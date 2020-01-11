/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';
import * as THREE from './../libs/three/Three.js';

let _renderer, _camera, _scene; 
let _controls = null, _terrain = null;

function lanhrag() {
	let _masx = [0, 4, 10 , 5, 0, -2, -7];
	let _masz = [0, 4, 8 , 10, 12, 14, 16];

}

class MainEngenie {

	constructor(c_fov, c_Width, c_Height) {

		// renderer settings
		_renderer = new THREE.WebGLRenderer({ antialias:true });
		_renderer.setClearColor(0x808080);
		_renderer.setPixelRatio(window.devicePixelRatio);
		_renderer.setSize(window.innerWidth, window.innerHeight);

		_camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 9000);
		_camera.position.set(0, 160, 100);
		_scene = new THREE.Scene();

		let axesHelper = new THREE.AxesHelper(15);
		_scene.add(axesHelper);
		_camera.lookAt(axesHelper.position);

		_controls = new CameraControls(_camera, 'Window');
		_terrain = new Terrain({scene: _scene, camera: _camera});
	}

	Render() {

		_renderer.render(_scene, _camera);
	}
	
	getRender() {

		return _renderer;
	}

	getTerrain() {

		return _terrain;
	}

	getControlsCamera() {

		return _controls;
	}
}

export {MainEngenie};
