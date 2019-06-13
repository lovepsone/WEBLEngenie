/*
* author lovepsone
*/

const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };

class CameraControls {

	constructor(_camera, _viewport) {

		this.element = document.getElementById(_viewport);

		this.enabled = true;
		this.center = new THREE.Vector3();
		this.panSpeed = 0.002;
		this.zoomSpeed = 0.1;
		this.rotationSpeed = 0.005;

		this.object = _camera;

		this.vector = new THREE.Vector3();
		this.delta = new THREE.Vector3();
		//var box = new THREE.Box3();

		this.state = STATE.NONE;

		this.normalMatrix = new THREE.Matrix3();
		this.pointerOld = new THREE.Vector2();
		this.spherical = new THREE.Spherical();
		//var sphere = new THREE.Sphere();
		
		this.changeEvent = { type: 'change' };

		this.element.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);
		this.element.addEventListener("contextmenu", this.onDocumentContextMenu, false );
		this.element.addEventListener("wheel", this.onDocumentMouseWheel.bind(this), false );
	}

	focus(target) {

		var distance;

		/*box.setFromObject( target );

		if ( box.isEmpty() === false ) {

			box.getCenter( center );
			distance = box.getBoundingSphere( sphere ).radius;

		} else {

			// Focusing on an Group, AmbientLight, etc

			center.setFromMatrixPosition( target.matrixWorld );
			distance = 0.1;

		}

		delta.set( 0, 0, 1 );
		delta.applyQuaternion( object.quaternion );
		delta.multiplyScalar( distance * 4 );

		object.position.copy( center ).add( delta );

		scope.dispatchEvent( changeEvent );*/

	}

	pan(delta) {

		var distance = this.object.position.distanceTo(this.center);

		delta.multiplyScalar(distance * this.panSpeed);
		delta.applyMatrix3(this.normalMatrix.getNormalMatrix(this.object.matrix));

		this.object.position.add( delta );
		this.center.add(delta);

	}

	zoom(delta) {

		var distance = this.object.position.distanceTo(this.center);

		delta.multiplyScalar(distance * this.zoomSpeed );

		if (delta.length() > distance) return;

		delta.applyMatrix3(this.normalMatrix.getNormalMatrix(this.object.matrix ));

		this.object.position.add(delta);

	};

	rotate(delta) {

		this.vector.copy(this.object.position).sub(this.center);

		this.spherical.setFromVector3(this.vector);

		this.spherical.theta += delta.x * this.rotationSpeed;
		this.spherical.phi += delta.y * this.rotationSpeed;

		this.spherical.makeSafe();

		this.vector.setFromSpherical(this.spherical);

		this.object.position.copy(this.center).add(this.vector);

		this.object.lookAt(this.center);

	}

	onDocumentMouseDown(event) {

		if (this.enabled === false) return;

		if (event.button === 0) {

			this.state = STATE.ROTATE;

		} else if ( event.button === 1 ) {

			this.state = STATE.ZOOM;

		} else if ( event.button === 2 ) {

			this.state = STATE.PAN;

		}

		this.pointerOld.set(event.clientX, event.clientY);

		this.element.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
		this.element.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false);
		this.element.addEventListener("mouseout", this.onDocumentMouseUp.bind(this), false);
		this.element.addEventListener("dblclick", this.onDocumentMouseUp.bind(this), false);

	}

	onDocumentMouseMove(event) {

		if (this.enabled === false) return;

		var movementX = event.clientX - this.pointerOld.x;
		var movementY = event.clientY - this.pointerOld.y;

		if (this.state === STATE.ROTATE) {

			this.rotate(this.delta.set(- movementX, - movementY, 0));

		} else if (this.state === STATE.ZOOM ) {

			this.zoom(this.delta.set(0, 0, movementY));

		} else if (this.state === STATE.PAN ) {

			this.pan(this.delta.set(- movementX, movementY, 0));

		}

		this.pointerOld.set(event.clientX, event.clientY);

	}

	onDocumentMouseUp(event) {

		this.element.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false );
		this.element.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false );
		this.element.addEventListener("mouseout", this.onDocumentMouseUp.bind(this), false );
		this.element.addEventListener("dblclick", this.onDocumentMouseUp.bind(this), false );

		this.state = STATE.NONE;

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