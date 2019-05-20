/*
* author lovepsone
*/

/*	style html :
*	{'tag': '', 'id': '', 'class': '', 'style': '', 'parent': '', 'text': ''}
*/

import {lang} 			from './../lang/lang.js';

var txt = lang['ru'];
var onClickList = ['CreateObject', 'SaveObject', 'LoadObject'];
var DialogList = ['DialogCreateObject'];
var ButtonList = ['bDialogCreate', 'bDialogCancel'];
var ParamList = ['WidthObject', 'LengthObject'];

var HTMLlist = [
	// widjet
	{'tag': 'dialog', 'id': 'DialogCreateObject', 'children': [
		{'tag': 'form', 'id': 'f_createObject', 'method': 'dialog', 'children': [
			{'tag': 'h3', 'class': 'd_header', 'text': txt.CreateObject[0]},
			{'tag': 'div', 'class': 'd_body', 'text': txt.CreateObject[1], 'children': [
				{'tag': 'label', 'for': 'WidthObject', 'text': txt.CreateObject[2]},
				{'tag': 'input', 'id': 'WidthObject', 'class': 'Number', 'type': 'number', 'value': 10},
				{'tag': 'label', 'for': 'LengthObject', 'text': txt.CreateObject[3]},
				{'tag': 'input', 'id': 'LengthObject', 'class':'Number', 'type': 'number', 'value': 10},
			]},
			{'tag': 'div', 'class': 'd_footer', 'align': 'center', 'children': [
				{'tag': 'input', 'id': 'bDialogCreate', 'class': 'dButton', 'type': 'button', 'value': txt.CreateObject[4]},
				{'tag': 'input', 'id': 'bDialogCancel', 'class': 'dButton',  'type': 'button', 'value': txt.CreateObject[5]},
			]},
		]},
	]},
	//
	{'tag': 'div', 'id': 'Window'},
	// menu bar
	{'tag': 'div', 'id': 'menubar', 'children': [
		{'tag': 'div', 'class': 'menu', 'children': [
			{'tag': 'div', 'class': 'title', 'text': txt.MenuBar[0]},
			{'tag': 'div', 'class': 'options', 'children': [
				{'tag': 'div', 'id': onClickList[0], 'class': 'option', 'text': txt.MenuBar[1]},
				{'tag': 'div', 'id': onClickList[1], 'class': 'option', 'text': txt.MenuBar[2]},
				{'tag': 'div', 'id': onClickList[2], 'class': 'option', 'text': txt.MenuBar[3]},
			]},
		]},
	
	]},
	//side bar 
	{'tag': 'div', 'id': 'sidebar', 'children': [
		{'tag': 'div', 'class': 'Panel', 'text': 'test'},

		{'tag': 'form', 'name': 'test', 'method': 'post', 'action': 'input1.php', 'children': [
			{'tag': 'input', 'type': 'text', 'size': 20},
		]},
	]},
	
];


export {HTMLlist, onClickList, DialogList, ButtonList, ParamList};