/*
* author lovepsone
*/

let _radius = 0.5;
let _strength = 0.5;
let _mesh = null;
let _camera = null;

import {MouseMoveOnTerrain} from './MouseMoveOnTerrain.js';
import {sphereIntersectTriangle} from './../libs/BVH/Utils/MathUtilities.js';
import * as THREE from './../libs/three/Three.js';

class PressureTerrain extends MouseMoveOnTerrain {

	constructor(_viewObject, _terrain, _viewport) {

		super(_viewport);

		_mesh = _terrain;
		_camera = _viewObject;
	}

	onDocumentMouseMove(event) {

		event.preventDefault();

		this.getVector().x = (event.layerX / window.innerWidth ) * 2 - 1;
		this.getVector().y = - (event.layerY / window.innerHeight ) * 2 + 1;
		this.getRayCaster().setFromCamera(this.getVector(), _camera);
		this.getRayCaster().firstHitOnly = true;

		let intersects = this.getRayCaster().intersectObject(_mesh);
		let bvh = _mesh.geometry.boundsTree;
		this.getBrush().scale.setScalar(_radius);

		if (intersects.length > 0) {

			this.getBrush().position.copy(intersects[0].point);

			if (this.getMoseDown()) {

				const indices = [];
				const sphere = new THREE.Sphere(this.getBrush().position, _radius);
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

		_radius  = r / 10.0;
	}

	UpdateStrength(s) {

		_strength = s / 5.0;
	}
}

export {PressureTerrain};