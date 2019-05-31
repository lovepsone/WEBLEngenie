/*
* author lovepsone
*/

/*	style html :
*	{'tag': '', 'id': '', 'class': '', 'style': '', 'parent': '', 'text': ''}
*/

import {lang} 			from './../lang/lang.js';

var txt = lang['ru'];

var elemsList = {
	'onClickList': ['CreateTerrain', 'SaveTerrain', 'LoadTerrain'],
	'DialogList': ['DialogCreateObject'],
	'ButtonList': ['bDialogCreate', 'bDialogCancel'],
	'ParamList': ['WidthObject', 'LengthObject'],
};

var HTMLlist = [
	// widjet
	{'tag': 'dialog', 'id': elemsList.DialogList[0], 'children': [
		{'tag': 'form', 'id': 'f_createObject', 'method': 'dialog', 'children': [
			{'tag': 'h3', 'class': 'd_header', 'text': txt.CreateTerrain[0]},
			{'tag': 'div', 'class': 'd_body', 'text': txt.CreateTerrain[1], 'children': [
				{'tag': 'label', 'for': 'WidthObject', 'text': txt.CreateTerrain[2]},
				{'tag': 'input', 'id': elemsList.ParamList[0], 'class': 'Number', 'type': 'number', 'value': 10},
				{'tag': 'label', 'for': 'LengthObject', 'text': txt.CreateTerrain[3]},
				{'tag': 'input', 'id': elemsList.ParamList[1], 'class':'Number', 'type': 'number', 'value': 10},
			]},
			{'tag': 'div', 'class': 'd_footer', 'align': 'center', 'children': [
				{'tag': 'input', 'id': elemsList.ButtonList[0], 'class': 'dButton', 'type': 'button', 'value': txt.CreateTerrain[4]},
				{'tag': 'input', 'id': elemsList.ButtonList[1], 'class': 'dButton',  'type': 'button', 'value': txt.CreateTerrain[5]},
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
				{'tag': 'div', 'id': elemsList.onClickList[0], 'class': 'option', 'text': txt.MenuBar[1]},
				{'tag': 'div', 'id': elemsList.onClickList[1], 'class': 'option', 'text': txt.MenuBar[2]},
				{'tag': 'div', 'id': elemsList.onClickList[2], 'class': 'option', 'text': txt.MenuBar[3]},
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


export {HTMLlist, elemsList};