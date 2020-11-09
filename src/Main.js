/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';
import {PointerLockControls} from './ui/PointerLockControls.js';
import * as THREE from './../libs/three/Three.js';
import {GLTFLoader} from './../libs/GLTFLoader.js';
import {Physics} from './physics/physics.js';
//import {DRACOLoader} from './../libs/';

let _renderer, _camera, _scene; 
let _controls = null, _pointerLockControls = null, _terrain = null;
let _worker = null;
let _phisics = null;

class MainEngenie {

	constructor(c_fov, c_Width, c_Height) {

		const canvas = document.createElement( 'canvas' );
		const context = canvas.getContext('webgl2', {alpha: true, antialias: false});
		// renderer settings
		_renderer = new THREE.WebGLRenderer(/*{ antialias:true }*/{ canvas: canvas, context: context });
		_renderer.setClearColor(0x808080);
		_renderer.setPixelRatio(window.devicePixelRatio);
		_renderer.setSize(window.innerWidth, window.innerHeight);
		_renderer.outputEncoding = THREE.sRGBEncoding;

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

		////////////////////////////
		//_phisics = new Phisics(false, './../../libs/ammo.js', true);
		/*_phisics = new Physics();
		let t_plane = _phisics.Mesh(
			new THREE.PlaneBufferGeometry(100, 100, 32),
			new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide}),
		);

		_scene.add(t_plane);

		let t_shere = _phisics.Mesh(
			new THREE.SphereBufferGeometry(2, 32, 32),
			new THREE.MeshBasicMaterial( {color: 0xffff00}),
			{mass: 110, position: [0, 1100, 0], quat: [0, 0, 0, 1]}
		);
		_scene.add(t_shere);

		let t_shere2 = _phisics.Mesh(
			new THREE.SphereBufferGeometry(5, 32, 32),
			new THREE.MeshBasicMaterial( {color: 0xffffff}),
			{mass: 2, position: [1, 150, 0]}
		);
		_scene.add(t_shere2);

		let t_box = _phisics.Mesh(
			new THREE.BoxBufferGeometry(6, 6, 6),
			new THREE.MeshBasicMaterial({color: 0x00ff00}),
			{mass: 300, position: [2, 180, 0]}
		);
		_scene.add(t_box);

		let t_cone = _phisics.Mesh(
			new THREE.ConeBufferGeometry( 5, 20, 32 ),
			new THREE.MeshBasicMaterial( {color: 0xffff00} ),
			{mass: 2, position: [2, 130, 1]}
		);
		_scene.add(t_cone);
		////////////////////////////////
		var ambient = new THREE.AmbientLight( 0x222222 );
		_scene.add( ambient );
		var spotLight = new THREE.SpotLight( 0xffffff );
		spotLight.position.set(0, 1000, 0 );
		_scene.add(spotLight);
		//var tex = new THREE.TextureLoader().load('./Meshes/Foliage/Grass/T_Grass_003_BC.png');
		//var mat = new THREE.MeshPhysicalMaterial({map: tex});

		var loader = new GLTFLoader().setPath( './Meshes/Foliage/Grass/Meshes/');
		loader.load( 'SM_Fern_01.gltf', function ( gltf ) {
			gltf.scene.traverse( function ( child ) {

				if ( child.isMesh ) {

					// TOFIX RoughnessMipmapper seems to be broken with WebGL 2.0
					// roughnessMipmapper.generateMipmaps( child.material );
					//_phisics.Mesh(child, {}, {mass: 0, position: [0, 0, 0]});
					child.material.side = THREE.DoubleSide;
					//child.material = mat;
					//child.material.needsUpdate = true;
					child.scale.set(0.25, 0.25, 0.25);
					_scene.add(child);
				}

			} );
		});*/
	}

	Render() {

		//_phisics.needUpdate();
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
}

export {MainEngenie};