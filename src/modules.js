/*
* Author lovepsone
*/
'use strict'

import {MainEngenie} 				from './Main.js';
import {LoaderHTML5} 				from './ui/LoaderHTML.js';
import {HTMLlist, elemsList}			from './ui/HTMLlist.js';
import {lang} 					from './lang/lang.js';

var Language = 'ru';

new LoaderHTML5(HTMLlist);

document.getElementById(elemsList.onClickList[0]).addEventListener("click", onClickCreateTerrain, false);
document.getElementById(elemsList.onClickList[1]).addEventListener("click", onClickSaveTerrain, false);
document.getElementById(elemsList.onClickList[2]).addEventListener("click", onClickLoadTerrain, false);

document.getElementById(elemsList.ButtonList[0]).addEventListener("click", onClickButtonCreateTerrain, false);
document.getElementById(elemsList.ButtonList[1]).addEventListener("click", onClickButtonCancelDialog, false);

for (var i = 0; i < elemsList.bTabsList.length; i++) {

	document.getElementById(elemsList.bTabsList[i]).addEventListener("click", {handleEvent: onClickButtonTabs, NameTab: elemsList.nTabsList[i], button: elemsList.bTabsList[i]}, false);
}

var Frame = document.getElementById('Window');
var Engenie = new MainEngenie(60, window.innerWidth, window.innerHeight);

Frame.appendChild(Engenie.getRender().domElement);

var AnimationFrame = function() {
	requestAnimationFrame(AnimationFrame);
	Engenie.Render();
};

AnimationFrame();

function onClickCreateTerrain() {

	document.getElementById(elemsList.DialogList[0]).showModal();
}

function onClickSaveTerrain() {

}

function onClickLoadTerrain() {

}

function onClickButtonCreateTerrain() {

	Engenie.CreateObject(document.getElementById(elemsList.ParamList[0]).value, document.getElementById(elemsList.ParamList[1]).value);
	document.getElementById(elemsList.DialogList[0]).close();
	
}

function onClickButtonCancelDialog() {

	document.getElementById(elemsList.DialogList[0]).close();
}

function onClickButtonTabs(event) {

	for (var i = 0; i < elemsList.nTabsList.length; i++) {

		document.getElementById(elemsList.nTabsList[i]).style.display = "none";
		document.getElementById(elemsList.bTabsList[i]).className = document.getElementById(elemsList.bTabsList[i]).className.replace(" active", "");
	}

	document.getElementById(this.NameTab).style.display = "block";
	document.getElementById(this.button).className += " active";
}