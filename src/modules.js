/*
* Author lovepsone
*/
'use strict'

import {MainEngenie} 				from './Main.js';
import {LoaderHTML5} 				from './ui/LoaderHTML.js';
import {HTMLlist, onClickList, DialogList, ButtonList, ParamList} 	from './ui/HTMLlist.js';
import {lang} 					from './lang/lang.js';

var Language = 'ru';

new LoaderHTML5(HTMLlist);

document.getElementById(onClickList[0]).addEventListener("click", onClickCreateObject, false);
document.getElementById(onClickList[1]).addEventListener("click", onClickSaveObject, false);
document.getElementById(onClickList[2]).addEventListener("click", onClickLoadObject, false);

document.getElementById(ButtonList[0]).addEventListener("click", onClickButtonCreateObject, false);
document.getElementById(ButtonList[1]).addEventListener("click", onClickButtonCancelDialog, false);

var Frame = document.getElementById('Window');
var Engenie = new MainEngenie(60, window.innerWidth, window.innerHeight);

Frame.appendChild(Engenie.getRender().domElement);

var AnimationFrame = function() {
	requestAnimationFrame(AnimationFrame);
	Engenie.Render();
};

AnimationFrame();

function onClickCreateObject() {

	document.getElementById(DialogList[0]).showModal();
}

function onClickSaveObject() {

}

function onClickLoadObject() {

}

function onClickButtonCreateObject() {

	Engenie.CreateObject(document.getElementById(ParamList[0]).value, document.getElementById(ParamList[1]).value);
	document.getElementById(DialogList[0]).close();
	
}

function onClickButtonCancelDialog() {

	document.getElementById(DialogList[0]).close();
}
