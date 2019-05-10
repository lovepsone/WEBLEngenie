/*
* Author lovepsone
*/
'use strict'

import {MainEngenie} 				from './Main.js';
import {LoaderHTML5} 				from './ui/LoaderHTML.js';
import {HTMLlist, onClickList, DialogList} 	from './ui/HTMLlist.js';
import {lang} 					from './lang/lang.js';

var Language = 'ru';
//var TEXT = lang[Language].CreateObject;

//console.log(HTMLlist2);
//new LoaderHTML(HTMLlist);
new LoaderHTML5(HTMLlist);
document.getElementById(onClickList[0]).addEventListener("click", onClickCreateObject, false);
/*
$(`#${onClickList[0]}`).bind("click", onClickCreateObject);
$(`#${onClickList[1]}`).bind("click", onClickSaveObject);
$(`#${onClickList[2]}`).bind("click", onClickLoadObject);
*/
function onClickCreateObject() {

	var modal = document.getElementById(DialogList[0]);
	modal.showModal();
}

function onClickSaveObject() {
	console.log(2);
}

function onClickLoadObject() {
	console.log(3);
}

var Frame = document.getElementById('Window');
var Engenie = new MainEngenie(60, window.innerWidth, window.innerHeight);

//Frame.append(Engenie.getRender().domElement);
Frame.appendChild(Engenie.getRender().domElement);
var AnimationFrame = function() {
	requestAnimationFrame(AnimationFrame);
	Engenie.Render();
};
	
AnimationFrame();
