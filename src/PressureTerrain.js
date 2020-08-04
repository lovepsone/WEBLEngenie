/*
* author lovepsone
*/

let _radius = 0.1, _strength = 0.5; // options
let _mesh = null, _camera = null; // object3d

let _mouseVector = new THREE.Vector2(), _raycaster = new THREE.Raycaster();
let _MouseDown = false;
let bindMouseDown, bindMouseUp, bindMouseMove;
let _brushMesh = null;

import {sphereIntersectTriangle} from './../libs/BVH/Utils/MathUtilities.js';
import * as THREE from './../libs/three/Three.js';

class PressureTerrain {

	constructor(_viewObject, _viewport, _scene) {

		_camera = _viewObject;
		this.element = document.getElementById(_viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseUp = this.onDocumentMouseUp.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);

		_brushMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), new THREE.MeshStandardMaterial({color: 0xEC407A, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5}));
		_brushMesh.name = "Brush";
		_scene.add(_brushMesh);
	}

	setTerrain(mesh) {

		_mesh = mesh;
	}

	onDocumentMouseDown(event) {

		event.preventDefault();
		_MouseDown = true;
	}

	onDocumentMouseUp(event) {

		event.preventDefault();
		_MouseDown = false;
		_mesh.geometry.computeBoundsTree();
	}

	onDocumentMouseMove(event) {

		event.preventDefault();

        if (!(_mesh instanceof THREE.Mesh)) {

            console.warn('PressureTerrain.js: Create geometry before overlaying pen.');
            return;
		}

		_mouseVector.x = (event.layerX / window.innerWidth ) * 2 - 1;
		_mouseVector.y = - (event.layerY / window.innerHeight ) * 2 + 1;
		_raycaster.setFromCamera(_mouseVector, _camera);
		_raycaster.firstHitOnly = true;

		let intersects = _raycaster.intersectObject(_mesh);
		let bvh = _mesh.geometry.boundsTree;
		_brushMesh.scale.setScalar(_radius);
		_brushMesh.visible = false;

		if (intersects.length > 0) {

			_brushMesh.visible = true;
			_brushMesh.position.copy(intersects[0].point);

			if (_MouseDown) {

				const indices = [];
				const sphere = new THREE.Sphere(_brushMesh.position, _radius);
				let posAttr = _mesh.geometry.getAttribute('position');
				const indexAttr =_mesh.geometry.index;

				bvh.shapecast(_mesh, box => sphere.intersectsBox(box), (tri, a, b, c) => 
				{
					
					if (sphereIntersectTriangle(sphere, tri)) {

						indices.push(a, b, c);
					}
	
					return false;
	
				});
				
				for (let i = 0, l = indices.length; i < l; i ++ ) {
					
					let index = indexAttr.getX(indices[i]);
					let y = posAttr.getY(index) + _strength;
					posAttr.setY(index, y);
				}
				posAttr.needsUpdate = true;
			}
		}
	}

	UpdateRadius(r) {

		_radius  =  r / 5.0;
	}

	UpdateStrength(s) {

		_strength = s / 5.0;
	}

	AddEvents() {

		this.element.addEventListener("mousedown", bindMouseDown, false);
		this.element.addEventListener("mouseup", bindMouseUp, false);
		this.element.addEventListener("mousemove", bindMouseMove, false);
		_brushMesh.visible = true;
	}
	
	DisposeEvents() {

		this.element.removeEventListener("mousedown", bindMouseDown, false);
		this.element.removeEventListener("mouseup", bindMouseUp, false);
		this.element.removeEventListener("mousemove", bindMouseMove, false);
		_brushMesh.visible = false;
	}

}

export {PressureTerrain};