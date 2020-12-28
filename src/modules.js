/*
* Author lovepsone
*/

import {MainEngenie} 				from './Main.js';
import {LoaderHTML5} 				from './ui/LoaderHTML.js';
import {HTMLlist, DataHTML}			from './ui/HTMLlist.js';
import {UI, UIFrame}				from './ui/UI.js';
import {lang} 						from './lang/lang.js';
import {BASEDATATEXTURES}			from './CONST.js';
import Stats						from './../libs/stats.module.js'

const Language = 'ru';

new LoaderHTML5(HTMLlist);
let _UIFrame = new UIFrame(DataHTML.Camera, DataHTML.Wireframe);
let Frame = UI.getElement('Window');
let Engenie = new MainEngenie(60, window.innerWidth, window.innerHeight);
let stats = new Stats();

Frame.appendChild(Engenie.getRender().domElement);
Frame.appendChild(stats.dom);

var AnimationFrame = function() {

	requestAnimationFrame(AnimationFrame);
	Engenie.Render();
	stats.update();
};

AnimationFrame();


function ControlBrush(currentTab) {

	// controls material terrain
	if (currentTab == 1) {

		Engenie.getTerrain().setDefaultMaterial(UI.getElement(DataHTML.Wireframe).checked);
		Engenie.getTerrain().getOptions().road.WireFrame(UI.getElement(DataHTML.Wireframe).checked);
	} else {

		if (Engenie.getTerrain().getOptions().texture.getChangeBiomes()) {

			Engenie.getTerrain().UpdateDataColors();
			Engenie.getTerrain().getOptions().texture.setBiomeMap(Engenie.getTerrain().getOptions().biomeMap.getMapColors());
		}
		Engenie.getTerrain().getOptions().texture.GenerateMaterial(UI.getElement(DataHTML.Wireframe).checked);
		Engenie.getTerrain().getOptions().road.WireFrame(UI.getElement(DataHTML.Wireframe).checked);
	}

	if (UI.getElement(DataHTML.Camera).checked) {

		Engenie.getTerrain().getOptions().pressure.DisposeEvents();
		Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
		Engenie.getTerrain().getOptions().road.DisposeEvents();
		return;
	}

	switch(currentTab) {

		case 0: // editor terrain
			Engenie.getTerrain().getOptions().pressure.AddEvents();
			Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
			Engenie.getTerrain().getOptions().road.DisposeEvents();
			break;

		case 1: // editor biomes
			Engenie.getTerrain().getOptions().pressure.DisposeEvents();
			Engenie.getTerrain().getOptions().road.DisposeEvents();
			Engenie.getTerrain().getOptions().biomeMap.AddEvents();
			break;

		case 2: // editor roads
			Engenie.getTerrain().getOptions().pressure.DisposeEvents();
			Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
			Engenie.getTerrain().getOptions().road.AddEvents();
			break;

		case 3: // editor texture
			Engenie.getTerrain().getOptions().pressure.DisposeEvents();
			Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
			Engenie.getTerrain().getOptions().road.DisposeEvents();
			break;
	}
}

// checked camera or brush
UI.getElement(DataHTML.Camera).checked = true;
Engenie.getControlsCamera().UpdateEvents();
UI.getElement(DataHTML.Camera).addEventListener("click", function() {

	if (UI.getElement(DataHTML.Camera).checked) {

		UI.getElement(DataHTML.Brush).checked = false;
		Engenie.getControlsCamera().UpdateEvents();
	} else {

		UI.getElement(DataHTML.Brush).checked = true;
		Engenie.getControlsCamera().dispose();
	}
	ControlBrush(_UIFrame.getCurrentTab());
});

UI.getElement(DataHTML.Brush).addEventListener("click", function() {

	if (UI.getElement(DataHTML.Brush).checked) {

		UI.getElement(DataHTML.Camera).checked = false;
		Engenie.getControlsCamera().dispose();
	} else {

		UI.getElement(DataHTML.Camera).checked = true;
		Engenie.getControlsCamera().UpdateEvents();
	}
	ControlBrush(_UIFrame.getCurrentTab());
});

UI.getElement(DataHTML.SizeBrush).addEventListener("change", function(event) {

	Engenie.getTerrain().getOptions().pressure.UpdateRadius(event.srcElement.value);
	Engenie.getTerrain().getOptions().biomeMap.UpdateRadius(event.srcElement.value);
	UI.getElement(DataHTML.ValBrush).innerHTML = event.srcElement.value;
}, false);

// handlers Menu Bar
UI.getElement(DataHTML.MenuBar.CreateTerrain).addEventListener("click", function() {

	UI.getElement(DataHTML.DialogCreateTerrain.widjet).showModal();
}, false);

//play simulatuon
UI.getElement(DataHTML.MenuBar.PlaySimulation).addEventListener("click", function() {

	Engenie.getTerrain().getMesh().geometry.computeVertexNormals();
	Engenie.getControlsCamera().dispose();
	Engenie.startCharacterControl();
	Engenie.getPointerLockControls().start();
	UI.getElement(DataHTML.Camera).checked = false;
	Engenie.getControlsCamera().UpdateEvents();
	Engenie.getPhysics().Mesh(Engenie.getTerrain().getMesh(), {}, {w: Engenie.getTerrain().getSize(), h: Engenie.getTerrain().getSize(), type: 'terrain'});
}, false);

// exit simulation
UI.getElement("Window").addEventListener("ExitPointerLock", function() {

	Engenie.getPointerLockControls().dispose();
	UI.getElement(DataHTML.Camera).checked = true;
}, false);

UI.getElement(DataHTML.MenuBar.SaveTerrain).addEventListener("click", function() {

	const link = UI.createElement('a');
	link.style.display = 'none';
	UI.body.appendChild(link);
	Engenie.exportGLTF(link);
}, false);

UI.getElement(DataHTML.MenuBar.LoadTerrain).addEventListener("click", function() {

	Engenie.importGLTF();
	console.log('Loading terrain in developing');
}, false);

// handlers dialog load height map
UI.getElement(DataHTML.MenuBar.LoadHeightMap).addEventListener("click", function() {

	UI.getElement(DataHTML.DialogLoadHeightMap.widjet).showModal();
}, false);

UI.getElement(DataHTML.MenuBar.NoisePerlin).addEventListener("click", function() {

	Engenie.HeightMapNoisePerlin();
}, false);

UI.getElement(DataHTML.MenuBar.DiamondSquare).addEventListener("click", function() {

	Engenie.HeightDiamondSquare();
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

// handlers roughness height map
UI.getElement(DataHTML.ValRoughnessHeightMap).addEventListener("change", function(event) {

	let val = parseInt(event.srcElement.value);
	if (val === 0) val = 1; 
	Engenie.getTerrain().setRoughness(val);
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
		ControlBrush(_UIFrame.getCurrentTab());
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

	Engenie.getTerrain().getOptions().pressure.UpdateStrength(event.srcElement.value);
	UI.getElement(DataHTML.Pressuere.Values[0]).innerHTML = event.srcElement.value;
}, false);

//handlers checked wareframe
UI.getElement(DataHTML.Wireframe).addEventListener("change", function(event) {

	Engenie.getTerrain().WireFrame(event.srcElement.checked);
	Engenie.getTerrain().getOptions().road.WireFrame(UI.getElement(DataHTML.Wireframe).checked);
}, false);

// handlers biomes
UI.getElement(DataHTML.Biomes.Buttons[0]).addEventListener("click", function(event) {

	Engenie.BiomeGenerateDataPixels();
}, false);

// biomes Apply
UI.getElement(DataHTML.Biomes.Buttons[1]).addEventListener("click", function(event) {

	Engenie.getTerrain().ApplyBiomes();
	Engenie.getTerrain().getOptions().texture.ChangeBiomes();
}, false);

//handlers Edit Road
UI.getElement(DataHTML.Road.Buttons[0]).addEventListener("click", function(event) {

	Engenie.RoadGenerate(_UIFrame.CheckedWireframe());
}, false);

//handlers Edit Biomes
for (let i = 2; i < 16; i++) {

	UI.getElement(DataHTML.Biomes.Buttons[i]).addEventListener("click", function(event) {

		Engenie.getTerrain().getOptions().biomeMap.setColor(event.target.className);
		Engenie.getTerrain().getOptions().texture.ChangeBiomes();
	}, false);
}

//handlers Edit Texture Atlas
UI.getElement(DataHTML.Texture.Buttons[0]).addEventListener("click", function(event) {

	Engenie.getTerrain().UpdateDataColors();
	Engenie.getTerrain().getOptions().texture.setBiomeMap(Engenie.getTerrain().getOptions().biomeMap.getMapColors());
	Engenie.getTerrain().getOptions().texture.GenerateMaterial(UI.getElement(DataHTML.Wireframe).checked);
}, false);

//pre-load icon texture
for (let i = 0; i < DataHTML.Texture.Values.length; i++) {

	UI.getElement(DataHTML.Texture.Values[i]).style.background  =  `url(${BASEDATATEXTURES[i][1]}.jpg)`;
}

for (let i = 0; i < DataHTML.Texture.Options.length; i++) {

	UI.getElement(DataHTML.Texture.Options[i]).addEventListener("change", function () {

		if (this.files[0]) {

			let fr = new FileReader();
			
			fr.addEventListener("load", function() {
				
				UI.getElement(DataHTML.Texture.Values[i]).style.background  = `url(${fr.result})`;
				UI.ToolTip.UpdateStyle();
				Engenie.getTerrain().getOptions().texture.ReLoadTexrure(i, fr.result);
			  }, false);
		  
			  fr.readAsDataURL(this.files[0]);
			  Engenie.getTerrain().getOptions().texture.ChangeBiomes();
		}
	}, false);
}

// start ToolTips
UI.ToolTip.Int();