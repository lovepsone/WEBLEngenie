/*
* author lovepsone
*/

let _mouseVector = new THREE.Vector3();
let _raycaster = new THREE.Raycaster();
let _MouseDown = false;

class MouseMoveOnTerrain {

	constructor(_viewport) {

		this.element = document.getElementById(_viewport);
		this.AddEvents();
	}
	
	onDocumentMouseDown(event) {

		event.preventDefault();
		_MouseDown = true;
	}
	
	onDocumentMouseUp(event) {

		event.preventDefault();
		_MouseDown = false;
	}

	onDocumentMouseMove(event) {

		event.preventDefault();

		if (_MouseDown) {

			var x = (event.layerX / window.innerWidth ) * 2 - 1;
			var y = - (event.layerY / window.innerHeight ) * 2 + 1;
			_mouseVector.set(x, y, 0.5);
		}
		
	}

	AddEvents() {

		this.element.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);
		this.element.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false);
		this.element.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
	}
	
	DisposeEvents() {

		this.element.removeEventListener("mousedown", this.onDocumentMouseDown, false);
		this.element.removeEventListener("mouseup", this.onDocumentMouseUp, false);
		this.element.removeEventListener("mousemove", this.onDocumentMouseMove, false);
	}

	getMoseDown() {

		return _MouseDown;
	}

	getRayCaster() {

		return _raycaster;
	}

	getVector() {

		return _mouseVector;
	}
}

export {MouseMoveOnTerrain};