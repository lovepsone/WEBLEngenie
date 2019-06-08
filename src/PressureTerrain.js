/*
* author lovepsone
*/

import {MouseMoveOnTerrain} from './MouseMoveOnTerrain.js';

class PressureTerrain extends MouseMoveOnTerrain {

	constructor(_camera, _terrain, _viewport) {

		super(_camera, _terrain, _viewport);

		this.radius = 0.5;
		this.strength = 0.005;
	}

	getIntersects(x, y) {

		x = (x / window.innerWidth ) * 2 - 1;
		y = - (y / window.innerHeight ) * 2 + 1;
		this.mouseVector.set(x, y, 0.5);
		this.raycaster.setFromCamera(this.mouseVector, this.camera);
		return this.raycaster.intersectObject(this.mesh, true);
	}

	onDocumentMouseMove(event) {

		event.preventDefault();

		if (this.MouseDown) {

			var intersects = this.getIntersects(event.layerX, event.layerY);

			if (intersects.length > 0) {
				this.getPositionsGeometry(this.mesh.geometry.attributes.position.array, intersects[0].point);
				this.mesh.geometry.attributes.position.needsUpdate = true;
			}
		}
		
	}
	
	getPositionsGeometry(_position, _point) {

		var buf = [], r = 0;

		for (var i = 0; i < _position.length; i += 3) {
			//(x — x_0)^2 + (y — y_0)^2 <= R^2
			if (this.radius > (r = Math.pow((_point.x - _position[i]), 2) + Math.pow((_point.y - _position[i+1]),2))) {

				_position[i+2] += this.strength;
			}
		}

		return buf;
	}

	UpdateRadius(r) {

		this.radius = r / 10;
	}

	UpdateStrength(s) {

		this.strength = s / 1000;
	}
}

export {PressureTerrain};