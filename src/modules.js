/*
* Author lovepsone
*/

import {MainEngenie} 				from './Main.js';
import {LoaderHTML5} 				from './ui/LoaderHTML.js';
import {HTMLlist, DataHTML}			from './ui/HTMLlist.js';
import {lang} 						from './lang/lang.js';

var Language = 'ru';

new LoaderHTML5(HTMLlist);

var Frame = document.getElementById('Window');
var Engenie = new MainEngenie(60, window.innerWidth, window.innerHeight);

Frame.appendChild(Engenie.getRender().domElement);

var AnimationFrame = function() {

	requestAnimationFrame(AnimationFrame);
	Engenie.Render();
};

AnimationFrame();

// handlers Menu Bar
document.getElementById(DataHTML.MenuBar.CreateTerrain).addEventListener("click", function() {

	document.getElementById(DataHTML.DialogCreateTerrain.widjet).showModal();
}, false);

document.getElementById(DataHTML.MenuBar.SaveTerrain).addEventListener("click", function() {

	console.log('Save terrain in developing');
}, false);

document.getElementById(DataHTML.MenuBar.LoadTerrain).addEventListener("click", function() {

	console.log('Loading terrain in developing');
}, false);

// handlers dialog load height map
document.getElementById(DataHTML.MenuBar.LoadHeightMap).addEventListener("click", function() {

	document.getElementById(DataHTML.DialogLoadHeightMap.widjet).showModal();

}, false);

document.getElementById(DataHTML.DialogLoadHeightMap.Buttons[0]).addEventListener("click", function(event) {

	let reader = new FileReader();
	let file = document.getElementById(DataHTML.DialogLoadHeightMap.File).files[0];
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
		}, false);

		image.load;
		document.getElementById(DataHTML.DialogLoadHeightMap.widjet).close();
	};

}, false);

document.getElementById(DataHTML.DialogLoadHeightMap.Buttons[1]).addEventListener("click", function() {

	document.getElementById(DataHTML.DialogLoadHeightMap.widjet).close();

}, false);

// handlers Right Bar
for (let i = 0; i < DataHTML.RightBar.Buttons.length; i++) {

	document.getElementById(DataHTML.RightBar.Buttons[i]).addEventListener("click", {
			handleEvent: function(event) {

				for (let i = 0; i < DataHTML.RightBar.Contents.length; i++) {

					document.getElementById(DataHTML.RightBar.Contents[i]).style.display = "none";
					document.getElementById(DataHTML.RightBar.Buttons[i]).className = document.getElementById(DataHTML.RightBar.Buttons[i]).className.replace(" active", "");
				}

				document.getElementById(this.NameTab).style.display = "block";
				document.getElementById(this.button).className += " active";

			}, NameTab: DataHTML.RightBar.Contents[i], button: DataHTML.RightBar.Buttons[i]
		}, false);
}

// handlers Dialog Create Terrain
document.getElementById(DataHTML.DialogCreateTerrain.Buttons[0]).addEventListener("click", function() {

	let width = document.getElementById(DataHTML.DialogCreateTerrain.Options[0]).value;
	let height = document.getElementById(DataHTML.DialogCreateTerrain.Options[1]).value;
	Engenie.getTerrain().Create(width, height);
	
	document.getElementById(DataHTML.DialogCreateTerrain.widjet).close();

}, false);

document.getElementById(DataHTML.DialogCreateTerrain.Buttons[1]).addEventListener("click", function() {
	
	document.getElementById(DataHTML.DialogCreateTerrain.widjet).close();

}, false);

// handlers Pressuere Terrain
document.getElementById(DataHTML.Pressuere.Options[0]).addEventListener("change", function(event) {

	let terrain = Engenie.getTerrain();
	terrain.setPressureRadius(event.srcElement.value);
	document.getElementById(DataHTML.Pressuere.Values[0]).innerHTML = event.srcElement.value;

}, false);

document.getElementById(DataHTML.Pressuere.Options[1]).addEventListener("change", function(event) {

	let terrain = Engenie.getTerrain();
	terrain.setPressureStrength(event.srcElement.value);
	document.getElementById(DataHTML.Pressuere.Values[1]).innerHTML = event.srcElement.value;

}, false);

// handlers cheked camera
document.getElementById(DataHTML.Camera).addEventListener("change", function(event) {

	if (event.srcElement.checked) {

		Engenie.getControlsCamera().UpdateEvents();
		Engenie.getTerrain().PressureDisposeEvents();
	} else {

		Engenie.getControlsCamera().dispose();
		Engenie.getTerrain().PressureUpdateEvents();
	}
	
}, false);

//handlers cheked wareframe
document.getElementById(DataHTML.Wireframe).addEventListener("change", function(event) {

	if (event.srcElement.checked) {

		Engenie.getTerrain().WireFrame(true);
	} else {

		Engenie.getTerrain().WireFrame(false);
	}
	
}, false);
// handlers biomes
document.getElementById(DataHTML.Biomes.Buttons[0]).addEventListener("click", function(event) {

	Engenie.getTerrain().getBiomes().GenerateDataPixels();

}, false);

// biomes Apply
document.getElementById(DataHTML.Biomes.Buttons[1]).addEventListener("click", function(event) {

	Engenie.getTerrain().ApplyBiomes();

}, false);
