/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';
import {CameraControls} from './CameraControls.js';
import * as THREE from './../libs/three/Three.js';

//import {BSPNode} from './../libs/CSG2/BSPNode.js';
//import {intersect, union, subtract, cutout} from './../libs/CSG2/boolean.js';
//import {convertGeometryToTriangles, transformBSP} from './../libs/CSG2/meshUtils.js';

let _renderer, _camera, _scene; 
let _controls = null, _terrain = null;

class MainEngenie {

	constructor(c_fov, c_Width, c_Height) {

		const canvas = document.createElement( 'canvas' );
		const context = canvas.getContext('webgl2', {alpha: true, antialias: false});
		// renderer settings
		_renderer = new THREE.WebGLRenderer(/*{ antialias:true }*/{ canvas: canvas, context: context });
		_renderer.setClearColor(0x808080);
		_renderer.setPixelRatio(window.devicePixelRatio);
		_renderer.setSize(window.innerWidth, window.innerHeight);

		_camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 9000);
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




		/*let geometry = new THREE.PlaneGeometry(500,500, 10, 10);
		geometry.rotateX(-Math.PI / 2);

		let meshA = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({side: THREE.DoubleSide, wireframe: true}));
		//_scene.add(meshA);

		let points = [
			new THREE.Vector3(0, 0, 10),
			new THREE.Vector3(10, 0, -20),
			new THREE.Vector3(20, 0, -10),
			new THREE.Vector3(30, 0, -10)
		];
		let shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, 5);
		shape.moveTo(0, 5);
		shape.lineTo(5, 5);
		shape.moveTo(5, 5);
		shape.lineTo(5, 0);
		shape.moveTo(5, 0);
		let extrudeSettings = {steps: 50, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(points, false)};
		let extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	
	
		let meshB = new THREE.Mesh(extrudeGeometry, new THREE.MeshBasicMaterial({color: 0xff0000,  wireframe:true}));
		meshB.position.y = 2,5;
		//_scene.add(meshB);

		let a = new BSPNode(convertGeometryToTriangles(geometry));
		let b = new BSPNode(convertGeometryToTriangles(extrudeGeometry));

		const bsp1Transformed = transformBSP(a, meshA);
		const bsp2Transformed = transformBSP(b, meshB);
		const result = cutout(bsp1Transformed, bsp2Transformed);
		const geometryR = result.toGeometry();

		geometryR.computeBoundingBox();
		const offset = new THREE.Vector3();
		geometryR.boundingBox.getCenter(offset);
		geometryR.translate(-offset.x, -offset.y, -offset.z);
	  
		const mesh111 = new THREE.Mesh(geometryR, new THREE.MeshBasicMaterial({color: 0xff0000,  wireframe:true}));
		mesh111.position.copy(offset);
		_scene.add(mesh111);
		let shape2 = new THREE.Shape();
		shape2.moveTo(0, 0);
		shape2.lineTo(0, 5);
		let extrudeSettings2 = {steps: 50, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(points, false)};
		let extrudeGeometry2 = new THREE.ExtrudeBufferGeometry(shape2, extrudeSettings);
		let meshC = new THREE.Mesh(extrudeGeometry2, new THREE.MeshBasicMaterial({color: 0xffff00}));
		_scene.add(meshC);*/
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