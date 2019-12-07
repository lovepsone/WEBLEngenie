/*
* author lovepsone
*/
let UI = document;
UI.getElement = document.getElementById;

let elemCamera = null;
let elemWireframe = null;

class UIFrame {

	constructor(camera, wireframe) {

		elemCamera = camera;
		elemWireframe = wireframe;
	}

	CheckedCamera() {

		if (UI.getElement(elemCamera).checked)
			return true;

		return false;
	}

	CheckedWireframe() {

		if (UI.getElement(elemWireframe).checked)
			return true;

		return false;
	}
}

export {UI, UIFrame};