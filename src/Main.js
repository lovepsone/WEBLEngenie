/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';
import {PointerLockControls} from './ui/PointerLockControls.js';
import * as THREE from './../libs/three.module.js';
import {Physics} from './physics/physics.js';
import {GLTFExporter} from './../libs/GLTFExporter.js';
import {GLTFLoader} from './../libs/GLTFLoader.js';

let _renderer, _camera, _scene, _dirLight, _DebugLight, _timer = {lastTimeMsec: null, delta: 0, now: 0}; 
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

		const hemiLight = new THREE.HemisphereLight(0x282828, 0xc8c8c8); //0x444444
		hemiLight.position.set(0, 120, 0);
		_scene.add(hemiLight);

		_dirLight = new THREE.DirectionalLight(0xffffe0);
		_dirLight.position.set(0, 100, 0);
		_dirLight.castShadow = true;
		_dirLight.shadow.mapSize.width = 2048 * 2;
		_dirLight.shadow.mapSize.height = 2048 * 2;
		_DebugLight = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 32, 32), new THREE.MeshBasicMaterial({color: 0xffff00}));
		_dirLight.add(_DebugLight);
		_scene.add(_dirLight);
	}

	Render(nowMsec) {

		_physics.needUpdate();
		this.updateLight(nowMsec);
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

	RoadGenerate(wireframe) {

		const buf = _terrain.getOptions().road.Generate(wireframe);
		_worker.postMessage({'cmd': 'RoadGenerate', 'points': buf.points, 'ExtrudePoints': buf.ExtrudePoints, 'Wireframe': wireframe});
	}

	HeightMapNoisePerlin() {

		_worker.postMessage({'cmd': 'HeightMapPerlin', 'size': _terrain.getSize()});
	}

	HeightDiamondSquare() {

		_worker.postMessage({'cmd': 'HeightMapDiamondSquare', 'size': _terrain.getSize()});
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
				_terrain.UpdateDataColors();
				_terrain.getOptions().texture.ChangeBiomes();
				_terrain.getOptions().texture.setBiomeMap(_terrain.getOptions().biomeMap.getMapColors());
				_terrain.getOptions().texture.GenerateMaterial(event.data.wireframe);
				break;

			case 'HeightMapPerlinGenerate':
				_terrain.ApplyNoise(event.data.colors);
				break;

			case 'HeightMapDiamondSquareGenerate':
				_terrain.setRoughness(2, false);
				_terrain.ApplyNoise(event.data.colors);
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

	//test function
	exportGLTF(link) {

		const gltfExporter = new GLTFExporter();

		gltfExporter.parse(_terrain.getMesh(), function(result) {

			if (result instanceof ArrayBuffer) {

				link.href = URL.createObjectURL(new Blob([result], {type: 'application/octet-stream'}));
				link.download = 'terrain.glb';
				link.click();
			} else {

				const output = JSON.stringify(result, null, 2);
				link.href = URL.createObjectURL(new Blob([output], {type: 'text/plain'}));
				link.download = 'terrain.gltf';
				link.click();
			}
		}, {embedImages: true, binary: false});
	}

	//test function
	importGLTF() {

		const loader = new GLTFLoader();//.setPath( './');

		loader.load('terrain.gltf', function(gltf) {

			/*gltf.scene.traverse(function (child) {

				if ( child.isMesh ) {
				}
			});*/

			console.log(gltf.scene);
			_scene.add(gltf.scene);
		},

		function(xhr) {

			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},

		function (error) {

			console.log('An error happened');
		});
	}

	updateLight(now) {

		_timer.lastTimeMsec = _timer.lastTimeMsec || now - 1000/60;
		const deltaMsec	= Math.min(200, now - _timer.lastTimeMsec);
		_timer.lastTimeMsec = now;
		_timer.delta = deltaMsec / 1000;
		_timer.now = now / 1000;

		const angle	= _timer.now * Math.PI * 2 * 0.2;
		_dirLight.position.x = Math.cos(angle) * 50;
		_dirLight.position.y = Math.sin(angle) * 50;
	}
}

export {MainEngenie};