/*
* author lovepsone
*/

class MouseMoveOnTerrain {

	constructor(_camera, _terrain, _viewport) {

		const context = this;
		this.raycaster = new THREE.Raycaster();
		this.mouseVector = new THREE.Vector3();
		this.camera = _camera;
		this.mesh = _terrain;
		this.element = document.getElementById(_viewport);
		this.MouseDown = false;

		this.element.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);
		this.element.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false);
		this.element.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
	}
	
	onDocumentMouseDown(event) {

		event.preventDefault();
		this.MouseDown = true;
	}
	
	onDocumentMouseUp(event) {

		event.preventDefault();
		this.MouseDown = false;
	}

	onDocumentMouseMove(event) {

		event.preventDefault();

		if (this.MouseDown) {

			var x = (event.layerX / window.innerWidth ) * 2 - 1;
			var y = - (event.layerY / window.innerHeight ) * 2 + 1;
			this.mouseVector.set(x, y, 0.5);
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
		this.element.removeEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
	}

	set AddNewTerrain(mesh) {

		this.mesh = mesh;
	}
}

export {MouseMoveOnTerrain};