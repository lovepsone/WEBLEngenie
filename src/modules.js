/*
* Author lovepsone
*/

import {MainEngenie} 				from './Main.js';
import {LoaderHTML5} 				from './ui/LoaderHTML.js';
import {HTMLlist, DataHTML}			from './ui/HTMLlist.js';
import {UI, UIFrame}				from './ui/UI.js';
import {lang} 						from './lang/lang.js';

let Language = 'ru';

new LoaderHTML5(HTMLlist);
let _UIFrame = new UIFrame(DataHTML.Camera, DataHTML.Wireframe);
let Frame = UI.getElement('Window');
let Engenie = new MainEngenie(60, window.innerWidth, window.innerHeight);

Frame.appendChild(Engenie.getRender().domElement);

var AnimationFrame = function() {

	requestAnimationFrame(AnimationFrame);
	Engenie.Render();
};

AnimationFrame();

function ControlPen(currentTab) {

	let buf = currentTab;

	if (UI.getElement(DataHTML.Camera).checked) {

		buf = -1;
	} else {

		Engenie.getControlsCamera().dispose();
	}

	switch(buf) {

		case -1: //cancel all
			Engenie.getControlsCamera().UpdateEvents()
			Engenie.getTerrain().PressureDisposeEvents();
			break;
		
		case 0:
			Engenie.getTerrain().PressureUpdateEvents();
			break;

		case 1: // editor biomes
			Engenie.getTerrain().PressureDisposeEvents();
			break;

		case 2:
			Engenie.getTerrain().PressureDisposeEvents();
			break;
	}
}

// handlers Menu Bar
UI.getElement(DataHTML.MenuBar.CreateTerrain).addEventListener("click", function() {

	UI.getElement(DataHTML.DialogCreateTerrain.widjet).showModal();
}, false);


UI.getElement(DataHTML.MenuBar.SaveTerrain).addEventListener("click", function() {

	console.log('Save terrain in developing');
}, false);

UI.getElement(DataHTML.MenuBar.LoadTerrain).addEventListener("click", function() {

	console.log('Loading terrain in developing');
}, false);

// handlers dialog load height map
UI.getElement(DataHTML.MenuBar.LoadHeightMap).addEventListener("click", function() {

	UI.getElement(DataHTML.DialogLoadHeightMap.widjet).showModal();
}, false);

UI.getElement(DataHTML.DialogLoadHeightMap.Buttons[0]).addEventListener("click", function(event) {

	let reader = new FileReader();
	let file = UI.getElement(DataHTML.DialogLoadHeightMap.File).files[0];
	let image = new Image();

	reader.readAsDataURL(file);
// для оптимизации требуется удалить обработчкик
	reader.onload = function(res) {

		image.src = res.target.result;
		image.addEventListener("load", function() {

			Engenie.getTerrain().LoadHeightMap(image, image.width, image.height);
			image.load = null;
			image = null;
			reader.onload = null;
			reader = null;
			Engenie.getTerrain().WireFrame(_UIFrame.CheckedWireframe());
	
		}, false);

		image.load;

		UI.getElement(DataHTML.DialogLoadHeightMap.widjet).close();
	};
}, false);

UI.getElement(DataHTML.DialogLoadHeightMap.Buttons[1]).addEventListener("click", function() {

	UI.getElement(DataHTML.DialogLoadHeightMap.widjet).close();
}, false);

// handlers Right Bar
for (let i = 0; i < DataHTML.RightBar.Buttons.length; i++) {

	UI.getElement(DataHTML.RightBar.Buttons[i]).addEventListener("click", function(event) {

		for (let i = 0; i < DataHTML.RightBar.Contents.length; i++) {

			UI.getElement(DataHTML.RightBar.Contents[i]).style.display = "none";
			UI.getElement(DataHTML.RightBar.Buttons[i]).className = UI.getElement(DataHTML.RightBar.Buttons[i]).className.replace(" active", "");
		}

		UI.getElement(event.srcElement.name).style.display = "block";
		UI.getElement(event.srcElement.id).className += " active";
		_UIFrame.setCurrentTab(event.srcElement.value);
		ControlPen(_UIFrame.getCurrentTab());
	}, false);
}

// handlers Dialog Create Terrain
UI.getElement(DataHTML.DialogCreateTerrain.Buttons[0]).addEventListener("click", function() {

	let width = UI.getElement(DataHTML.DialogCreateTerrain.Options[0]).value;
	let height = UI.getElement(DataHTML.DialogCreateTerrain.Options[1]).value;

	Engenie.getTerrain().Create(width, height);
	Engenie.getTerrain().WireFrame(_UIFrame.CheckedWireframe());

	if (_UIFrame.CheckedCamera()) {

		Engenie.getControlsCamera().UpdateEvents();
		Engenie.getTerrain().PressureDisposeEvents();
	} else {

		Engenie.getControlsCamera().dispose();
		Engenie.getTerrain().PressureUpdateEvents();
	}

	UI.getElement(DataHTML.DialogCreateTerrain.widjet).close();
}, false);

UI.getElement(DataHTML.DialogCreateTerrain.Buttons[1]).addEventListener("click", function() {
	
	UI.getElement(DataHTML.DialogCreateTerrain.widjet).close();
}, false);

// handlers Pressuere Terrain
UI.getElement(DataHTML.Pressuere.Options[0]).addEventListener("change", function(event) {

	let terrain = Engenie.getTerrain();
	terrain.setPressureRadius(event.srcElement.value);
	UI.getElement(DataHTML.Pressuere.Values[0]).innerHTML = event.srcElement.value;
}, false);

UI.getElement(DataHTML.Pressuere.Options[1]).addEventListener("change", function(event) {

	let terrain = Engenie.getTerrain();
	terrain.setPressureStrength(event.srcElement.value);
	UI.getElement(DataHTML.Pressuere.Values[1]).innerHTML = event.srcElement.value;
}, false);

// handlers cheked camera
UI.getElement(DataHTML.Camera).addEventListener("change", function(event) {

	ControlPen(_UIFrame.getCurrentTab());
}, false);
//
//handlers checked wareframe
UI.getElement(DataHTML.Wireframe).addEventListener("change", function(event) {

	Engenie.getTerrain().WireFrame(event.srcElement.checked);
}, false);

// handlers biomes
UI.getElement(DataHTML.Biomes.Buttons[0]).addEventListener("click", function(event) {

	Engenie.getTerrain().getBiomes().GenerateDataPixels();
}, false);

// biomes Apply
UI.getElement(DataHTML.Biomes.Buttons[1]).addEventListener("click", function(event) {

	Engenie.getTerrain().ApplyBiomes();
}, false);

//handlers Edit Road
UI.getElement(DataHTML.Road.Options[0]).addEventListener("change", function(event) {

	console.log('handler checked Edit Road Pen in developing');
}, false);

UI.getElement(DataHTML.Road.Buttons[0]).addEventListener("click", function(event) {

	console.log('handler Generate Road in developing');
}, false);