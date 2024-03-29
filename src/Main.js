/*
* @author lovepsone 2019 - 2021
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';
import {PointerLockControls} from './ui/PointerLockControls.js';
import * as THREE from './../libs/three.module.js';
import {Physics} from './physics/physics.js';
import {FilerProject} from './FilerProject.js';
import {GLTFExporter} from './../libs/GLTFExporter.js';
import {GLTFLoader} from './../libs/GLTFLoader.js';
import {SunLight} from './SunLight.js';
import {Sky} from './Sky.js';

let _renderer, _camera, _scene; 
let _controls = null, _pointerLockControls = null, _terrain = null, _sky = null, _sunLight = null;
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
		//_sky = new Sky(_scene);
		_sunLight = new SunLight(_scene, true);
	
		window.addEventListener('resize', this.onRenderResize);
	}

	Render(frame) {

		_physics.needUpdate();
		_terrain.getOptions().pressure.needUpdate();
		//_sunLight.needUpdate(frame)
		_renderer.render(_scene, _camera);
	}
	
	getRender() {

		return _renderer;
	}

	getTerrain() {

		//_sky.update(1);
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
		_worker.postMessage({'cmd': 'RoadGenerate', 'points': buf.points, 'ExtrudePoints': buf.ExtrudePoints, 'Wireframe': wireframe, 'Size': buf.Size});
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

	SaveProject(link) {

		if (_terrain.getMesh() == 0) return;

		const size = _terrain.getSize();
		const points = _terrain.getMesh().geometry.getAttribute('position');
		const colors = _terrain.getMesh().geometry.getAttribute('color');
		const roads = _terrain.getOptions().road.getDataFile();
		const CountRoads = _terrain.getOptions().road.Count();

		const filer = new FilerProject(size);
		filer.newData(CountRoads, roads[roads.length - 1].length * 3);

		for (let i = 0; i < points.count; i++)
			filer.setChunk('points', points.getY(i), i);

		for (let i = 0; i <  colors.count * 3; i++)
			filer.setChunk('colors', colors.array[i], i);

		filer.setChunk('countroads', CountRoads);

		if (CountRoads > 0) filer.setDataRoadsChunk(roads);

		link.href = URL.createObjectURL(new Blob([filer.getData()], {type: 'application/octet-stream'}));
		link.download = 'Project.wgle';
		link.click();
		URL.revokeObjectURL(link.href);
	}

	LoadProject(file, UIOptionRoad) {

		const reader = new FileReader();
		reader.readAsArrayBuffer(file);

		reader.onload = function(event) {

			const filer = new FilerProject();
			const size = filer.setBytes(event.target.result);

			if (filer.getVersionReader()) {

				_terrain.Create(size);
				const points = _terrain.getMesh().geometry.getAttribute('position');
				const colors = _terrain.getMesh().geometry.getAttribute('color');

				for (let i = 0; i < size * size; i++) points.setY(i, filer.readChunk('points',  i));
				for (let i = 0; i < size * size * 3; i++) colors.array[i] = filer.readChunk('colors',  i);

				const CountRoads = filer.readChunk('countroads');

				if (CountRoads > 0) {
	
					const roads = filer.readDataRoadsChunk();

					for (let i = 0; i < CountRoads; i++) {

						_terrain.getOptions().road.setSize(roads[i].weightR)
						_terrain.getOptions().road.Generate(false, false, roads[i].point);
						UIOptionRoad.options[UIOptionRoad.options.length] = new Option(`Road (${i})`, i);
					}
				}
				_terrain.getMesh().geometry.getAttribute('position').needsUpdate = true;
				_terrain.getMesh().geometry.getAttribute('color').needsUpdate = true;
				_terrain.getMesh().geometry.computeVertexNormals();
				_terrain.getMesh().geometry.normalizeNormals();
				_terrain.getMesh().geometry.computeBoundsTree();
				_terrain.UpdateDataColors();
				_terrain.getOptions().texture.ChangeBiomes();
				_terrain.getOptions().texture.setBiomeMap(_terrain.getOptions().biomeMap.getMapColors());
			} else alert('The version of the download file is not supported !!!');
		}

		reader.onerror = function(err) {

			console.log(err);
		}
	}

	exportGLTF(link) {

	}

	importGLTF() {
	}
};

export {MainEngenie};