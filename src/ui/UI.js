/*
* author lovepsone
*/
let UI = document;
UI.getElement = document.getElementById;

let _elemCamera = null;
let _elemWireframe = null;
let _currentTab = 0;

class UIFrame {

	constructor(camera, wireframe) {

		_elemCamera = camera;
		_elemWireframe = wireframe;
	}

	CheckedCamera() {

		if (UI.getElement(_elemCamera).checked)
			return true;

		return false;
	}

	CheckedWireframe() {

		if (UI.getElement(_elemWireframe).checked)
			return true;

		return false;
	}

	setCurrentTab(id) {

		_currentTab = id;
	}

	getCurrentTab() {

		return _currentTab;
	}
}

export {UI, UIFrame};