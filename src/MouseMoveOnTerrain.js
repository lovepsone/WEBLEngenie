/*
* author lovepsone
*/

let _mouseVector = new THREE.Vector3();
let _raycaster = new THREE.Raycaster();
let _MouseDown = false;
let bindMouseDown, bindMouseUp, bindMouseMove;
let _brushMesh = null;

class MouseMoveOnTerrain {

	constructor(_viewport) {

		this.element = document.getElementById(_viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseUp = this.onDocumentMouseUp.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);

		_brushMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 40, 40), new THREE.MeshStandardMaterial({color: 0xEC407A, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5}));
		_brushMesh.name = "Brush";
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
		_brushMesh.visible = true;
	}
	
	DisposeEvents() {

		this.element.removeEventListener("mousedown", bindMouseDown, false);
		this.element.removeEventListener("mouseup", bindMouseUp, false);
		this.element.removeEventListener("mousemove", bindMouseMove, false);
		_brushMesh.visible = false;
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

	getBrush() {

		return _brushMesh;
	}
}

export {MouseMoveOnTerrain};