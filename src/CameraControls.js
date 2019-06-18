/*
* author lovepsone
*/

const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };
let _state = STATE.NONE;
let _object = null;
let _enabled = true;
let _center = new THREE.Vector3();
let _panSpeed, _zoomSpeed, _rotationSpeed;
let _vector = new THREE.Vector3();
let _spherical = new THREE.Spherical();
let _pointerOld = new THREE.Vector2();
let _normalMatrix = new THREE.Matrix3();

class CameraControls extends THREE.EventDispatcher {

	constructor(_camera, _viewport) {

		super();
		this.element = document.getElementById(_viewport);

		_panSpeed = 0.002;
		_zoomSpeed = 0.1;
		_rotationSpeed = 0.005;

		_object = _camera;

		this.delta = new THREE.Vector3();

		this.element.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);
		this.element.addEventListener("contextmenu", this.onDocumentContextMenu, false );
		this.element.addEventListener("wheel", this.onDocumentMouseWheel.bind(this), false );
	}

	focus(target) {

	this.dispatchEvent({type: 'change'});
}

	pan(delta) {

		let distance = _object.position.distanceTo(_center);

		delta.multiplyScalar(distance * _panSpeed);
		delta.applyMatrix3(_normalMatrix .getNormalMatrix(_object.matrix));

		_object.position.add( delta );
		_center.add(delta);

		this.dispatchEvent({type: 'change'});
	}

	zoom(delta) {

		let distance = _object.position.distanceTo(_center);

		delta.multiplyScalar(distance * _zoomSpeed);

		if (delta.length() > distance) return;

		delta.applyMatrix3(_normalMatrix .getNormalMatrix(_object.matrix ));

		_object.position.add(delta);

		this.dispatchEvent({type: 'change'});

	};

	rotate(delta) {

		_vector.copy(_object.position).sub(_center);

		_spherical.setFromVector3(_vector);
		_spherical.theta += delta.x * _rotationSpeed;
		_spherical.phi += delta.y * _rotationSpeed;
		_spherical.makeSafe();

		_vector.setFromSpherical(_spherical);

		_object.position.copy(_center).add(_vector);

		_object.lookAt(_center);

		this.dispatchEvent({type: 'change'});
	}

	onDocumentMouseDown(event) {

		if (_enabled === false) return;

		if (event.button === 0) {

			_state = STATE.ROTATE;

		} else if ( event.button === 1 ) {

			_state = STATE.ZOOM;

		} else if ( event.button === 2 ) {

			_state = STATE.PAN;

		}

		_pointerOld.set(event.clientX, event.clientY);

		this.element.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
		this.element.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false);
		this.element.addEventListener("mouseout", this.onDocumentMouseUp.bind(this), false);
		this.element.addEventListener("dblclick", this.onDocumentMouseUp.bind(this), false);

	}

	onDocumentMouseMove(event) {

		if (_enabled === false) return;

		var movementX = event.clientX - _pointerOld.x;
		var movementY = event.clientY - _pointerOld.y;

		if (_state === STATE.ROTATE) {

			this.rotate(this.delta.set(- movementX, - movementY, 0));

		} else if (_state === STATE.ZOOM ) {

			this.zoom(this.delta.set(0, 0, movementY));

		} else if (_state === STATE.PAN ) {

			this.pan(this.delta.set(- movementX, movementY, 0));

		}

		_pointerOld.set(event.clientX, event.clientY);

	}

	onDocumentMouseUp(event) {

		this.element.removeEventListener("mousemove", this.onDocumentMouseMove, false );
		this.element.removeEventListener("mouseup", this.onDocumentMouseUp, false );
		this.element.removeEventListener("mouseout", this.onDocumentMouseUp, false );
		this.element.removeEventListener("dblclick", this.onDocumentMouseUp, false );

		_state = STATE.NONE;

	}

	onDocumentMouseWheel(event) {

		event.preventDefault();

		this.zoom(this.delta.set( 0, 0, event.deltaY > 0 ? 1 : - 1 ));

	}

	onDocumentContextMenu(event) {

		event.preventDefault();
	}

	dispose() {

		this.element.removeEventListener("contextmenu", onDocumentContextMenu, false);
		this.element.removeEventListener("mousedown", onDocumentMouseDown, false);
		this.element.removeEventListener("wheel", onDocumentMouseWheel, false);

		this.element.removeEventListener("mousemove", onDocumentMouseMove, false);
		this.element.removeEventListener("mouseup", onDocumentMouseUp, false);
		this.element.removeEventListener("mouseout", onDocumentMouseUp, false);
		this.element.removeEventListener("dblclick", onDocumentMouseUp, false);
	}
	
}

export {CameraControls};