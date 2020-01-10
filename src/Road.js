/*
* author lovepsone
*/

import * as THREE from './../libs/three/Three.js';

let _CounterBox = 0
let _boxes = [];
let _mesh = null;
let _camera = null;
let _scene = null;
let _mouseVector = new THREE.Vector2();
let _raycaster = new THREE.Raycaster();

let bindMouseDown, bindMouseMove;
let _brushMesh = null;

class Road {

	constructor(viewObject, terrain, viewport, scene) {

		_mesh = terrain;
        _camera = viewObject;
        _scene = scene;

		this.element = document.getElementById(viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);

		_brushMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), new THREE.MeshStandardMaterial({color: 0xEC407A, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5}));
        _brushMesh.name = "BrushRoad";
        _brushMesh.visible = false;
        _scene.add(_brushMesh);
    }
    
	onDocumentMouseDown(event) {

        event.preventDefault();

        _boxes.push( new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), new THREE.MeshStandardMaterial({color: 0xEC407A, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5})));

        _mouseVector.x = (event.layerX / window.innerWidth ) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight ) * 2 + 1;

        _raycaster.setFromCamera(_mouseVector, _camera);

        let intersects = _raycaster.intersectObject(_mesh);

		if (intersects.length > 0) {

            _boxes[_CounterBox].position.copy(intersects[0].point);
            _scene.add(_boxes[_CounterBox]);

            _CounterBox++;
        }
	}
	
	onDocumentMouseMove(event) {

		event.preventDefault();

		_mouseVector.x = (event.layerX / window.innerWidth ) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight ) * 2 + 1;
        
		_raycaster.setFromCamera(_mouseVector, _camera);
		_raycaster.firstHitOnly = true;

		let intersects = _raycaster.intersectObject(_mesh);
		let bvh = _mesh.geometry.boundsTree;
        _brushMesh.scale.setScalar(1);

		if (intersects.length > 0) {

            _brushMesh.visible = true;
            _brushMesh.position.copy(intersects[0].point);
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
}

export {Road};