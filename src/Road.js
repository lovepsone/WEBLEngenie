/*
* author lovepsone
*/

import * as THREE from './../libs/three/Three.js';
import {MouseMoveOnTerrain} from './MouseMoveOnTerrain.js';

let _CounterBox = 0
let _boxes = [];
let _mesh = null;
let _camera = null;
let _mouseVector = new THREE.Vector2();
let _raycaster = new THREE.Raycaster();

let bindMouseDown, bindMouseMove;
let _brushMesh = null;

class Road {

	constructor(viewObject, terrain, viewport, scene) {

		_mesh = terrain;
        _camera = viewObject;
        
		this.element = document.getElementById(viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);

		_brushMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), new THREE.MeshStandardMaterial({color: 0xEC407A, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5}));
        _brushMesh.name = "BrushRoad";
        _brushMesh.visible = false;
        scene.add(_brushMesh);
    }
    
	onDocumentMouseDown(event) {

        event.preventDefault();
        
        console.log('test');
	}
	
	onDocumentMouseMove(event) {

		event.preventDefault();

		_mouseVector.x = (event.layerX / window.innerWidth ) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight ) * 2 + 1;
        
		this.getRayCaster().setFromCamera(this.getVector(), _camera);
		this.getRayCaster().firstHitOnly = true;

		let intersects = this.getRayCaster().intersectObject(_mesh);
		let bvh = _mesh.geometry.boundsTree;
		this.getBrush().scale.setScalar(1);

		if (intersects.length > 0) {

            _brushMesh.visible = true;
            this.getBrush().position.copy(intersects[0].point);
        } else {

            _brushMesh.visible = false;
        }
	}

	AddEvents() {

		this.element.addEventListener("mousedown", bindMouseDown, false);
		this.element.addEventListener("mousemove", bindMouseMove, false);
		_brushMesh.visible = true;
	}
	
	DisposeEvents() {

		this.element.removeEventListener("mousedown", bindMouseDown, false);
		this.element.removeEventListener("mousemove", bindMouseMove, false);
		_brushMesh.visible = false;
    }
    
	getRayCaster() {

		return _raycaster;
	}

	getVector() {

		return _mouseVector;
	}

	getBrush() {

		return _brushMesh;
	}
}

export {Road};