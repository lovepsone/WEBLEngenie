/*
* Author lovepsone
*/

import * as THREE from './../../libs/three/Three.js';

const EventExitPointerLock = new Event('ExitPointerLock');

let _havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

let _bindPointerLockChange, _bindMouseMove, _bindPointerLockError, _bindPointerLockClick, _isEnabled = false, _bindKeyDown, _bindKeyUp;
let _button = {moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, spase: false};
let _camera = null;
let _lat = 0, _lon = 0, _phi = 0, _theta = 0;
let _sensitivity = 0.06; // default sensitivity
let _target = new THREE.Vector3(0, 0, 0);

export class PointerLockControls {

    constructor(camera, viewport/*'Window'*/) {

        _camera = camera;
        _camera.rotation.set(0, 0, 0);
        this.element = document.getElementById(viewport);

        _bindPointerLockChange = this.pointerLockChange.bind(this);
        _bindMouseMove = this.onDocumentMouseMove.bind(this);
        _bindPointerLockError = this.pointerLockError.bind(this);
        _bindPointerLockClick = this.pointerLockClick.bind(this);
        _bindKeyUp = this.onKeyUp.bind(this);
        _bindKeyDown = this.onKeyDown.bind(this);
    }

    start() {

        if (_havePointerLock) {

			document.addEventListener('pointerlockchange', _bindPointerLockChange, false);
			document.addEventListener('mozpointerlockchange', _bindPointerLockChange, false);
			document.addEventListener('webkitpointerlockchange', _bindPointerLockChange, false);
			document.addEventListener('pointerlockerror', _bindPointerLockError, false);
			document.addEventListener('mozpointerlockerror', _bindPointerLockError, false);
            document.addEventListener('webkitpointerlockerror', _bindPointerLockError, false);

            this.element.addEventListener('click', _bindPointerLockClick, false);
        }
    }

    dispose() {

        document.removeEventListener('pointerlockchange', _bindPointerLockChange, false);
        document.removeEventListener('mozpointerlockchange', _bindPointerLockChange, false);
        document.removeEventListener('webkitpointerlockchange', _bindPointerLockChange, false);
        document.removeEventListener('pointerlockerror', _bindPointerLockError, false);
        document.removeEventListener('mozpointerlockerror', _bindPointerLockError, false);
        document.removeEventListener('webkitpointerlockerror', _bindPointerLockError, false);
        this.element.removeEventListener('click', _bindPointerLockClick, false);
    }

    pointerLockChange(event) {

        _isEnabled  = (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement === document.body) ? true : false;

        if (_isEnabled) {

            document.addEventListener('mousemove', _bindMouseMove, false);
            document.addEventListener('keydown', _bindKeyDown, false);
            document.addEventListener('keyup', _bindKeyUp, false);
        } else {


            document.removeEventListener('mousemove', _bindMouseMove, false);
            document.removeEventListener('keydown', _bindKeyDown, false);
            document.removeEventListener('keyup', _bindKeyUp, false);
            this.element.dispatchEvent(EventExitPointerLock);
        }
    }

    pointerLockError(event) {

        console.log('Your browser doesn\'t seem to support Pointer Lock API');
    }

    pointerLockClick(event) {

        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
        document.body.requestPointerLock(); // не работает с firefox
    }

    onDocumentMouseMove(event) {

		let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		_lat -= movementY * _sensitivity; // look Up and down
		_lon += movementX * _sensitivity; // look left and right

		/*
		 *Disabling line below will continue to calc phi
		 *after the the player looks all the way up
		 */
		_lat = Math.max(-85, Math.min(85, _lat)); //Lock up and down

		/*
		 *Find angle phi & theta
		 *and convert to radians
		 */
		_phi = (90 - _lat) * Math.PI / 180;
		_theta = _lon * Math.PI / 180;

		let targetPosition = _target, position = _camera.position;

		// Euler angles
		targetPosition.x = position.x + 100 * Math.sin(_phi) * Math.cos(_theta);
		targetPosition.y = position.y + 100 * Math.cos(_phi);
		targetPosition.z = position.z + 100 * Math.sin(_phi) * Math.sin(_theta);

		_camera.lookAt(targetPosition); // camera look at target
    }

    onKeyDown(event) {

        console.log(event.keyCode);
        switch (event.keyCode)
        {
            case 38: /*up*/
            case 87: /*W*/
            _button.moveForward = true;
                break;
            case 37: /*left*/
            case 65: /*A*/
            _button.moveLeft = true;
                break;
            case 40: /*down*/
            case 83: /*S*/
            _button.moveBackward = true;
                break;
            case 39: /*right*/
            case 68: /*D*/
            _button.moveRight = true;
                break;
            case 32: /*spase*/
                if (!_button.spase) _button.spase = true; else _button.spase = false;
            break;
        }
    }

    onKeyUp(event) {

		switch (event.keyCode)
		{
			case 38: /*up*/
			case 87: /*W*/
                _button.moveForward = false;
				break;
			case 37: /*left*/
			case 65: /*A*/
                _button.moveLeft = false;
				break;
			case 40: /*down*/
			case 83: /*S*/
                _button.moveBackward = false;
				break;
			case 39: /*right*/
			case 68: /*D*/
                _button.moveRight = false;
				break;
			case 32: /*spase*/
                _button.spase = false;
				break;
		}
    }
};