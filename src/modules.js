/*
* @author lovepsone 2019 - 2023
*/

import {MainEngenie} 				from './Main.js';
import {LoaderHTML5} 				from './ui/LoaderHTML.js';
import {HTMLlist, DataHTML}			from './ui/HTMLlist.js';
import {UI, UIFrame}				from './ui/UI.js';
import {lang} 						from './lang/lang.js';
import {BASEDATATEXTURES}			from './CONST.js';
import Stats						from './../libs/stats.module.js';
import {RenderInfo}					from './RenderInfo.js';

new LoaderHTML5(HTMLlist);
let _UIFrame = new UIFrame(DataHTML.Camera, DataHTML.Wireframe);
let Frame = UI.getElement('Window');
let Engenie = new MainEngenie(60, window.innerWidth, window.innerHeight);
let stats = new Stats();
let InfoRender = new RenderInfo();

Frame.appendChild(Engenie.getRender().domElement);
Frame.appendChild(stats.dom);
Frame.appendChild(InfoRender.getDOmElement());

let AnimationFrame = function(frame) {

	requestAnimationFrame(AnimationFrame);
	Engenie.Render(frame);
	stats.update();
	InfoRender.update(Engenie.getRender());
};

AnimationFrame();

// key event
window.addEventListener("wheel", function(event) {

	if (UI.getElement(DataHTML.Brush).checked) {

		const EventWheel = new Event('change');
		event.deltaY > 0 ? UI.getElement(DataHTML.SizeBrush).value-- : UI.getElement(DataHTML.SizeBrush).value++;
		UI.getElement(DataHTML.SizeBrush).dispatchEvent(EventWheel);
	}
}, false);

const bindKeyDown = function(event) {

	switch(event.keyCode) {

		case 87:
			const Event87 = new Event('change');
			UI.getElement(DataHTML.Wireframe).checked = !UI.getElement(DataHTML.Wireframe).checked;
			UI.getElement(DataHTML.Wireframe).dispatchEvent(Event87);
			break;

		case 69:
			const Event69 = new Event('change');
			if (UI.getElement(DataHTML.Camera).checked) Engenie.getControlsCamera().dispose(); else Engenie.getControlsCamera().UpdateEvents();
			UI.getElement(DataHTML.Camera).checked = !UI.getElement(DataHTML.Camera).checked;
			UI.getElement(DataHTML.Brush).checked = !UI.getElement(DataHTML.Brush).checked;
			ControlBrush(_UIFrame.getCurrentTab());
			UI.getElement(DataHTML.Wireframe).dispatchEvent(Event69);
			break;

		case 81:
			if(_UIFrame.getCurrentTab()) break;
			const Event81 = new Event('change');

			if (event.altKey) {

				if (UI.getElement(DataHTML.Pressuere.Options[1]).value > 1) break;
				UI.getElement(DataHTML.Pressuere.Options[1]).value++;
				UI.getElement(DataHTML.Pressuere.Options[1]).dispatchEvent(Event81);
			} else {

				UI.getElement(DataHTML.Pressuere.Options[0]).value++;
				UI.getElement(DataHTML.Pressuere.Options[0]).dispatchEvent(Event81);
			}
			break;

		case 65:
			if(_UIFrame.getCurrentTab()) break;
			const Event65 = new Event('change');

			if (event.altKey) {

				if (UI.getElement(DataHTML.Pressuere.Options[1]).value < 1) break;
				UI.getElement(DataHTML.Pressuere.Options[1]).value--;
				UI.getElement(DataHTML.Pressuere.Options[1]).dispatchEvent(Event65);
			} else {
				UI.getElement(DataHTML.Pressuere.Options[0]).value--;
				UI.getElement(DataHTML.Pressuere.Options[0]).dispatchEvent(Event65);
			}
			break;
	}
};

document.addEventListener("keydown", bindKeyDown, false);

function ControlBrush(currentTab) {

	// controls material terrain
	if (currentTab == 1 || currentTab == 0 || currentTab == 2) {

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
UI.getElement(DataHTML.Camera).addEventListener("change", function() {

	if (UI.getElement(DataHTML.Camera).checked) {

		UI.getElement(DataHTML.Brush).checked = false;
		Engenie.getControlsCamera().UpdateEvents();
	} else {

		UI.getElement(DataHTML.Brush).checked = true;
		Engenie.getControlsCamera().dispose();
	}
	ControlBrush(_UIFrame.getCurrentTab());
});

UI.getElement(DataHTML.Brush).addEventListener("change", function() {

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

// play simulatuon
UI.getElement(DataHTML.MenuBar.PlaySimulation).addEventListener("click", function() {

	document.removeEventListener("keydown", bindKeyDown, false);

	UI.getElement("menubar").style.visibility = "hidden";
	UI.getElement("sidebar").style.visibility = "hidden";
	UI.getElement("opt1bar").style.visibility = "hidden";
	UI.getElement("opt2bar").style.visibility = "hidden";
	UI.getElement("opt3bar").style.visibility = "hidden";
	UI.getElement("opt4bar").style.visibility = "hidden";

	Engenie.getControlsCamera().dispose();
	Engenie.getTerrain().getOptions().pressure.DisposeEvents();
	Engenie.getTerrain().getOptions().biomeMap.DisposeEvents();
	Engenie.getTerrain().getOptions().road.DisposeEvents();

	Engenie.startCharacterControl();
	Engenie.getPointerLockControls().start();
	UI.getElement(DataHTML.Camera).checked = false;
	Engenie.getControlsCamera().UpdateEvents();
	Engenie.getPhysics().Mesh(Engenie.getTerrain().getMesh(), {}, {w: Engenie.getTerrain().getSize(), h: Engenie.getTerrain().getSize(), type: 'terrain'});
}, false);

// exit simulation
UI.getElement("Window").addEventListener("ExitPointerLock", function() {

	document.addEventListener("keydown", bindKeyDown, false);
	UI.getElement("menubar").style.visibility = "visible";
	UI.getElement("sidebar").style.visibility = "visible";
	UI.getElement("opt1bar").style.visibility = "visible";
	UI.getElement("opt2bar").style.visibility = "visible";
	UI.getElement("opt3bar").style.visibility = "visible";
	UI.getElement("opt4bar").style.visibility = "visible";

	Engenie.getPointerLockControls().dispose();
	UI.getElement(DataHTML.Camera).checked = true;
	UI.getElement(DataHTML.Brush).checked = false;
}, false);

const linkSave = UI.createElement('a');
linkSave.style.display = 'none';
UI.body.appendChild(linkSave);

const formLoad = UI.createElement('form');
formLoad.style.display = 'none';
UI.body.appendChild(formLoad);

const fileInput = document.createElement('input');
fileInput.multiple = true;
fileInput.type = 'file';

formLoad.appendChild(fileInput);

fileInput.addEventListener('change', function() {

	Engenie.LoadProject(fileInput.files[0], UI.getElement(DataHTML.Road.Options[3]));
	formLoad.reset();
	UI.getElement(DataHTML.Wireframe).checked = false;
	UI.getElement(DataHTML.Camera).checked = true;
	UI.getElement(DataHTML.Brush).checked = false;
	// delete list roads
	for (let i = 0; i < UI.getElement(DataHTML.Road.Options[3]).options.length; i++)
		UI.getElement(DataHTML.Road.Options[3]).options[i].remove();
});

UI.getElement(DataHTML.MenuBar.SaveTerrain).addEventListener("click", function() {

	Engenie.SaveProject(linkSave);
}, false);

UI.getElement(DataHTML.MenuBar.LoadTerrain).addEventListener("click", function() {

	fileInput.click(1);
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
UI.getElement(DataHTML.MenuBar.Smoothing).addEventListener("click", function() {
	
	Engenie.getTerrain().Smoothing();
}, false);

// handlers lang
UI.getElement(DataHTML.MenuBar.EN).addEventListener("click", function(event) {

	document.cookie = 'lang=en';
	alert('Refresh the page to change the language. If your browser does not support cookies, the language will not change.');
}, false);

// handlers lang
UI.getElement(DataHTML.MenuBar.RU).addEventListener("click", function(event) {

	document.cookie = 'lang=ru';
	alert('Refresh the page to change the language. If your browser does not support cookies, the language will not change.');
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

	Engenie.getTerrain().Create(UI.getElement(DataHTML.DialogCreateTerrain.Options[0]).value);
	Engenie.getTerrain().WireFrame(_UIFrame.CheckedWireframe());
	UI.getElement(DataHTML.DialogCreateTerrain.widjet).close();
	ControlBrush(_UIFrame.getCurrentTab());

	// delete list roads
	for (let i = 0; i < UI.getElement(DataHTML.Road.Options[3]).options.length; i++)
		UI.getElement(DataHTML.Road.Options[3]).options[i].remove();
}, false);

UI.getElement(DataHTML.DialogCreateTerrain.Buttons[1]).addEventListener("click", function() {
	
	UI.getElement(DataHTML.DialogCreateTerrain.widjet).close();
}, false);

// handlers Pressuere Terrain
UI.getElement(DataHTML.Pressuere.Options[0]).addEventListener("change", function(event) {

	Engenie.getTerrain().getOptions().pressure.UpdateIntensity(event.srcElement.value);
	UI.getElement(DataHTML.Pressuere.Values[0]).innerHTML = event.srcElement.value;
}, false);

UI.getElement(DataHTML.Pressuere.Options[1]).addEventListener("change", function(event) {

	Engenie.getTerrain().getOptions().pressure.UpdateTypeBrush(event.srcElement.value);
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
UI.getElement(DataHTML.Road.Options[0]).addEventListener("change", function(event) {

	UI.getElement(DataHTML.Road.Values[0]).innerHTML = event.srcElement.value;
	Engenie.getTerrain().getOptions().road.setSize(Number(event.srcElement.value), 0);
}, false);

UI.getElement(DataHTML.Road.Options[1]).addEventListener("change", function(event) {

	UI.getElement(DataHTML.Road.Values[1]).innerHTML = event.srcElement.value;
	Engenie.getTerrain().getOptions().road.setSize(Number(event.srcElement.value), 1);
}, false);

UI.getElement(DataHTML.Road.Options[2]).addEventListener("change", function(event) {

	UI.getElement(DataHTML.Road.Options[2]).style.background = `#${event.srcElement.value}`;
	Engenie.getTerrain().getOptions().road.setColorBroad(event.srcElement.value);
}, false);

UI.getElement(DataHTML.Road.Buttons[0]).addEventListener("click", function(event) {

	Engenie.RoadGenerate(_UIFrame.CheckedWireframe());
	const el = UI.getElement(DataHTML.Road.Options[3]);
	const buff = Engenie.getTerrain().getOptions().road.getDataRoads();
	el.options[el.options.length] = new Option(`Road (${buff.length - 1})`, buff.length - 1);
}, false);

UI.getElement(DataHTML.Road.Options[3]).addEventListener("click", function(event) {

	Engenie.getTerrain().getOptions().road.UnSelect();
	if (event.target.value != '') Engenie.getTerrain().getOptions().road.Select(Number(event.target.value));
}, false);

UI.getElement(DataHTML.Road.Buttons[1]).addEventListener("click", function(event) {

	if (UI.getElement(DataHTML.Road.Options[3]).selectedIndex != -1) console.log('Update Road in developing');
}, false);

UI.getElement(DataHTML.Road.Buttons[2]).addEventListener("click", function(event) {

	if (UI.getElement(DataHTML.Road.Options[3]).selectedIndex != -1) {

		const id = UI.getElement(DataHTML.Road.Options[3]).options[UI.getElement(DataHTML.Road.Options[3]).selectedIndex].value;
		Engenie.getTerrain().getOptions().road.Remove(id);
		UI.getElement(DataHTML.Road.Options[3]).options[id].text = 'Deleted';
	}
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

// handlers Load Texture
UI.getElement(DataHTML.Texture.File).addEventListener("change", function() {

	let fr = new FileReader();
		
	fr.addEventListener("load", function() {
			
			Engenie.getTerrain().getOptions().texture.LoadCompleteTexture(fr.result);
	}, false);

	fr.readAsDataURL(this.files[0]);
}, false);

//pre-load icon texture
for (let i = 0; i < DataHTML.Texture.Values.length; i++) {

	UI.getElement(DataHTML.Texture.Values[i]).style.background  =  `url(${BASEDATATEXTURES[i][1]}.jpg)`;
}

for (let i = 0; i < DataHTML.Texture.Options.length; i++) {

	UI.getElement(DataHTML.Texture.Options[i]).addEventListener("change", function() {

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