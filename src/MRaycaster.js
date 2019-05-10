/*
* author lovepsone
*/

class MoseRaycaster {

	//var selectedObject = null;
	
	constructor(_camera, _children) {

		const context = this;
		this.raycaster = new THREE.Raycaster();
		this.mouseVector = new THREE.Vector3();
		this.camera = _camera;
		this.children = _children;
		this.MouseDown = false;
		var element = document.getElementById('Window');
		element.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
		element.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);
		element.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false);
	}

	getIntersects(x, y, _camera, _children, _mouseVector, _raycaster) {

		x = (x / window.innerWidth ) * 2 - 1;
		y = - (y / window.innerHeight ) * 2 + 1;
		_mouseVector.set(x, y, 0.5);
		_raycaster.setFromCamera(_mouseVector, _camera);
		return _raycaster.intersectObjects(_children, true);
	}

	onDocumentMouseMove(event) {

		event.preventDefault();
		if (this.MouseDown) {

			var intersects = this.getIntersects(event.layerX, event.layerY, this.camera, this.children, this.mouseVector, this.raycaster);
			
			if (intersects.length > 0) {
				this.getPositionsGeometry(this.children[0].geometry.attributes.position.array, intersects[0].point);
				this.children[0].geometry.attributes.position.needsUpdate = true;
			}
		}
		
	}
	
	onDocumentMouseDown(event) {

		event.preventDefault();
		this.MouseDown = true;
	}
	
	onDocumentMouseUp(event) {

		this.MouseDown = false;
	}
	
	getPositionsGeometry(_position, _point) {

		var buf = [], max_r = 0.5, r=0;
		for (var i = 0; i < _position.length; i += 3) {
			//(x — x_0)^2 + (y — y_0)^2 <= R^2
			if (max_r > (r = Math.pow((_point.x - _position[i]), 2) + Math.pow((_point.y -  _position[i+1]),2))) {

				_position[i+2] += 0.005;
			}
		}
		return buf;
	}
}

export {MoseRaycaster};