/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';
import {PointerLockControls} from './ui/PointerLockControls.js';
import * as THREE from './../libs/three.module.js';
import {Physics} from './physics/physics.js';


let _renderer, _camera, _scene; 
let _controls = null, _pointerLockControls = null, _terrain = null;
let _worker = null;
let _physics = null;

class MainEngenie {

	constructor(c_fov, c_Width, c_Height) {

		const canvas = document.createElement( 'canvas' );
		const context = canvas.getContext('webgl2', {alpha: true, antialias: false});
		// renderer settings
		_renderer = new THREE.WebGLRenderer({antialias: true}/*{ canvas: canvas, context: context }*/);
		_renderer.setClearColor(0x808080);
		_renderer.setPixelRatio(window.devicePixelRatio);
		_renderer.setSize(window.innerWidth, window.innerHeight);
		//_renderer.outputEncoding = THREE.sRGBEncoding;
		_renderer.shadowMap.enabled = true;

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
		_pointerLockControls = new PointerLockControls(_camera, 'Window');
		_terrain = new Terrain({scene: _scene, camera: _camera});

		_worker = new Worker('./src/Worker.js', {type: 'module'});
		_worker.onmessage = this.WorkerOnMessage;

		_physics = new Physics();

		const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
		hemiLight.position.set( 0, 20, 0 );
		_scene.add(hemiLight);

		const dirLight = new THREE.DirectionalLight(0xffffff);
		dirLight.position.set(- 3, 100, - 30);
		dirLight.castShadow = true;
		/*dirLight.shadow.camera.top = 2;
		dirLight.shadow.camera.bottom = - 2;
		dirLight.shadow.camera.left = - 2;
		dirLight.shadow.camera.right = 2;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 40;*/
		_scene.add(dirLight);

		/*const dLight = 200;
		const sLight = dLight * 0.25;
		light.shadow.camera.left = - sLight;
		light.shadow.camera.right = sLight;
		light.shadow.camera.top = sLight;
		light.shadow.camera.bottom = - sLight;

		light.shadow.camera.near = dLight / 30;
		light.shadow.camera.far = dLight;

		light.shadow.mapSize.x = 1024 * 2;
		light.shadow.mapSize.y = 1024 * 2;*/


		/*let t = new THREE.Mesh( new THREE.BoxBufferGeometry( 10, 10, 10, 1, 1, 1 ), new THREE.MeshPhongMaterial( { color: new THREE.Color(0x40ff40) } ));
		t.receiveShadow = true;
		t.castShadow = true;
		t.position.y = 30;
		_scene.add(t);*/

	}

	Render() {

		_physics.needUpdate();
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

	getPointerLockControls() {

		return _pointerLockControls;
	}

	getPhysics() {

		return _physics;
	}
	// functions worker
	BiomeGenerateDataPixels() {

		_worker.postMessage({'cmd': 'BiomeStart', 'size': _terrain.getOptions().biomes.getSize()});
	}

	RoadGenerate() {

		const buf = _terrain.getOptions().road.Generate();
		_worker.postMessage({'cmd': 'RoadGenerate', 'points': buf.points, 'ExtrudePoints': buf.ExtrudePoints});
	}

	WorkerOnMessage(event) {

        switch(event.data.cmd) {

            case 'BiomeDraw':
				_worker.postMessage({'cmd': 'BiomePixels', 'data': _terrain.getOptions().biomes.Draw(event.data.colors)});
                break;
            case 'BiomeComplete':
				_terrain.getOptions().biomes.setMoisture(event.data.result);
				break;
			case 'RoadComplete':
				_terrain.getOptions().road.Draw(event.data.dataRoad);
				break;
        }
	}

	onRenderResize() {

		_camera.aspect =  window.innerWidth / window.innerHeight;
		_camera.updateProjectionMatrix();
		_renderer.setSize( window.innerWidth, window.innerHeight);
	}

	startCharacterControl() {

		_scene.add(_physics.addCharacter({}, _pointerLockControls));
	}
}

export {MainEngenie};