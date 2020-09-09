/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';
import * as THREE from './../libs/three/Three.js';

let _renderer, _camera, _scene; 
let _controls = null, _terrain = null;
let _worker = null;

class MainEngenie {

	constructor(c_fov, c_Width, c_Height) {

		const canvas = document.createElement( 'canvas' );
		const context = canvas.getContext('webgl2', {alpha: true, antialias: false});
		// renderer settings
		_renderer = new THREE.WebGLRenderer(/*{ antialias:true }*/{ canvas: canvas, context: context });
		_renderer.setClearColor(0x808080);
		_renderer.setPixelRatio(window.devicePixelRatio);
		_renderer.setSize(window.innerWidth, window.innerHeight);

		_camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 9000);
		_camera.position.set(0, 160, 100);
		_scene = new THREE.Scene();
		//DEBUG
		window.scene = _scene;
		window.THREE = THREE;

		let axesHelper = new THREE.AxesHelper(15);
		_scene.add(axesHelper);
		_camera.lookAt(axesHelper.position);

		_controls = new CameraControls(_camera, 'Window');
		_terrain = new Terrain({scene: _scene, camera: _camera});

		_worker = new Worker('./src/Worker.js', {type: 'module'});
		_worker.onmessage = this.WorkerOnMessage;
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

	// functions worker
	BiomeGenerateDataPixels() {

		_worker.postMessage({'cmd': 'BiomeStart', 'size': _terrain.getOptions().biomes.getSize()});
	}

	WorkerOnMessage(event) {

        switch(event.data.cmd) {

            case 'BiomeDraw':
				_worker.postMessage({'cmd': 'BiomePixels', 'data': _terrain.getOptions().biomes.Draw(event.data.colors)});
                break;
            case 'BiomeComplete':
				_terrain.getOptions().biomes.setMoisture(event.data.result);
                break;
        }
	}
}

export {MainEngenie};