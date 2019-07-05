/*
* author lovepsone
*/

let _mouseVector = new THREE.Vector3();
let _raycaster = new THREE.Raycaster();
let _MouseDown = false;
let bindMouseDown, bindMouseUp, bindMouseMove;

class MouseMoveOnTerrain {

	constructor(_viewport) {

		this.element = document.getElementById(_viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseUp = this.onDocumentMouseUp.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);
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
			//_mouseVector.set(x, y, 0.5);
			//y=>z
			_mouseVector.set(x, 0.5, y);
		}
		
	}

	AddEvents() {

		this.element.addEventListener("mousedown", bindMouseDown, false);
		this.element.addEventListener("mouseup", bindMouseUp, false);
		this.element.addEventListener("mousemove", bindMouseMove, false);
	}
	
	DisposeEvents() {

		this.element.removeEventListener("mousedown", bindMouseDown, false);
		this.element.removeEventListener("mouseup", bindMouseUp, false);
		this.element.removeEventListener("mousemove", bindMouseMove, false);
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