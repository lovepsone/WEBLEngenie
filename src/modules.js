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
			Engenie.getControlsCamera().UpdateEvents();
			Engenie.getTerrain().getOptions().pressure.DisposeEvents();
			Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
			Engenie.getTerrain().getOptions().road.DisposeEvents();
			break;
		
		case 0:

			Engenie.getTerrain().getOptions().pressure.AddEvents();
			Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
			Engenie.getTerrain().getOptions().road.DisposeEvents();
			break;

		case 1: // editor biomes
			Engenie.getTerrain().getOptions().pressure.DisposeEvents();
			Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
			Engenie.getTerrain().getOptions().road.DisposeEvents();
			if (UI.getElement(DataHTML.Biomes.Options[0]).checked) Engenie.getTerrain().getOptions().biomeMap.AddEvents();
			break;

		case 2:
			Engenie.getTerrain().getOptions().pressure.DisposeEvents();
			Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
			Engenie.getTerrain().getOptions().road.DisposeEvents();
			if (UI.getElement(DataHTML.Road.Options[0]).checked) Engenie.getTerrain().getOptions().road.AddEvents();
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

			if (image.width === image.height && image.width < 1024 && image.width == Engenie.getTerrain().getSize()) {

				Engenie.getTerrain().LoadHeightMap(image);
				image.load = null;
				image = null;
				reader.onload = null;
				reader = null;
				Engenie.getTerrain().WireFrame(_UIFrame.CheckedWireframe());
			} else {

				image.load = null;
				image = null;
				reader.onload = null;
				reader = null;
				console.warn('Invalid image size.');
			}
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
// баг, если находишься в другой вкладке
	Engenie.getTerrain().Create(UI.getElement(DataHTML.DialogCreateTerrain.Options[0]).value);
	Engenie.getTerrain().WireFrame(_UIFrame.CheckedWireframe());

	if (_UIFrame.CheckedCamera()) {

		Engenie.getControlsCamera().UpdateEvents();
		Engenie.getTerrain().getOptions().pressure.DisposeEvents();
	} else {

		Engenie.getControlsCamera().dispose();
		Engenie.getTerrain().getOptions().pressure.AddEvents();
	}

	UI.getElement(DataHTML.DialogCreateTerrain.widjet).close();
}, false);

UI.getElement(DataHTML.DialogCreateTerrain.Buttons[1]).addEventListener("click", function() {
	
	UI.getElement(DataHTML.DialogCreateTerrain.widjet).close();
}, false);

// handlers Pressuere Terrain
UI.getElement(DataHTML.Pressuere.Options[0]).addEventListener("change", function(event) {

	Engenie.getTerrain().getOptions().pressure.UpdateRadius(event.srcElement.value);
	UI.getElement(DataHTML.Pressuere.Values[0]).innerHTML = event.srcElement.value;
}, false);

UI.getElement(DataHTML.Pressuere.Options[1]).addEventListener("change", function(event) {

	Engenie.getTerrain().getOptions().pressure.UpdateStrength(event.srcElement.value);
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

	Engenie.getTerrain().getOptions().biomes.GenerateDataPixels();
}, false);

// biomes Apply
UI.getElement(DataHTML.Biomes.Buttons[1]).addEventListener("click", function(event) {

	Engenie.getTerrain().ApplyBiomes();
}, false);

//handlers Edit Road
UI.getElement(DataHTML.Road.Options[0]).addEventListener("change", function(event) {

	if (UI.getElement(DataHTML.Road.Options[0]).checked) {

		Engenie.getTerrain().getOptions().road.AddEvents();
	} else {

		Engenie.getTerrain().getOptions().road.DisposeEvents();
	}
}, false);

UI.getElement(DataHTML.Road.Buttons[0]).addEventListener("click", function(event) {

	Engenie.getTerrain().getOptions().road.Generate();
}, false);

//handlers Edit Biomes
UI.getElement(DataHTML.Biomes.Options[0]).addEventListener("change", function(event) {

	if (UI.getElement(DataHTML.Biomes.Options[0]).checked) {

		Engenie.getTerrain().getOptions().biomeMap.AddEvents();
	} else {

		Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
	}
}, false);

for (let i = 2; i < 16; i++) {

	UI.getElement(DataHTML.Biomes.Buttons[i]).addEventListener("click", function(event) {

		Engenie.getTerrain().getOptions().biomeMap.setColor(event.target.className);
	}, false);
}