/*
* author lovepsone
*/

let _radius = 0.5;
let _strength = 0.005;
let _mesh = null;
let _camera = null;
let _worker = null;

import {MouseMoveOnTerrain} from './MouseMoveOnTerrain.js';

class PressureTerrain extends MouseMoveOnTerrain {

	constructor(_viewObject, _terrain, _viewport) {

		super(_viewport);

		_mesh = _terrain;
		_camera = _viewObject;
		_worker = new Worker('./src/WorkerPressure.js');
		_worker.onmessage = this.WorkerOnMessage;
	}

	onDocumentMouseMove(event) {

		event.preventDefault();

		if (this.getMoseDown()) {

			let x = (event.layerX / window.innerWidth ) * 2 - 1;
			let y = - (event.layerY / window.innerHeight ) * 2 + 1;

			//this.getVector().set(x, y, 0.5);
			this.getVector().set(x, y, 0.5);
			this.getRayCaster().setFromCamera(this.getVector(), _camera);
			let intersects = this.getRayCaster().intersectObject(_mesh);

			if (intersects.length > 0) {

				_worker.postMessage({'cmd': 'pressure', 'attr': _mesh.geometry.attributes.position.array, 'point': intersects[0].point});
				//this.getPositionsGeometry(_mesh.geometry.attributes.position.array, intersects[0].point);
				//_mesh.geometry.attributes.position.needsUpdate = true;
			}
		}
		
	}
	
	getPositionsGeometry(_position, _point) {

		let r = 0;

		for (var i = 0; i < _position.length; i += 3) {
			//(x � x_0)^2 + (y � y_0)^2 <= R^2
			if (_radius  > (r = Math.pow((_point.x - _position[i]), 2) + Math.pow((_point.z - _position[i+2]),2))) {

				_position[i+1] += _strength;
			}
		}

	}

	UpdateRadius(r) {

		_radius  = r / 1.0;
		_worker.postMessage({'cmd': 'radius', 'val': _radius});
	}

	UpdateStrength(s) {

		_strength = s / 1.0;
		_worker.postMessage({'cmd': 'strength', 'val': _strength});
	}

	WorkerOnMessage(e) {

		for (let i = 0; i < e.data.length; i++) {

			_mesh.geometry.attributes.position.array[e.data[i].i] = e.data[i].v;
		}
		_mesh.geometry.attributes.position.needsUpdate = true;

	}

	WorkerStop() {

		//_worker.postMessage({'cmd': 'stop'});
		_worker.terminate();
	}
}

export {PressureTerrain};