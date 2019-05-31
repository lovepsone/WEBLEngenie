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
	'bTabsList': ['TabButton1', 'TabButton2', 'TabButton3'],
	'nTabsList': ['tabcontent1', 'tabcontent2', 'tabcontent3'],
};

var HTMLlist = [
	// widjet
	{'tag': 'dialog', 'id': elemsList.DialogList[0], 'children': [
		{'tag': 'form', 'id': 'f_createObject', 'method': 'dialog', 'children': [
			{'tag': 'h3', 'style': 'border-bottom: 1px solid white;', 'text': txt.CreateTerrain[0]},
			{'tag': 'div', 'class': 'd_body', 'text': txt.CreateTerrain[1], 'children': [
				{'tag': 'label', 'for': 'WidthObject', 'text': txt.CreateTerrain[2]},
				{'tag': 'input', 'id': elemsList.ParamList[0], 'style':"font-size: 12px; border: 0px; margin: 5px;width: 60px;", 'type': 'number', 'value': 10},
				{'tag': 'label', 'for': 'LengthObject', 'text': txt.CreateTerrain[3]},
				{'tag': 'input', 'id': elemsList.ParamList[1], 'style':"font-size: 12px; border: 0px; margin: 5px;width: 60px;", 'type': 'number', 'value': 10},
			]},
			{'tag': 'div', 'style': 'border-bottom: 1px solid white;', 'align': 'center', 'children': [
				{'tag': 'input', 'id': elemsList.ButtonList[0], 'style': 'width: 200px;', 'type': 'button', 'value': txt.CreateTerrain[4]},
				{'tag': 'input', 'id': elemsList.ButtonList[1], 'style': 'width: 200px;',  'type': 'button', 'value': txt.CreateTerrain[5]},
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
		{'tag': 'div', 'id': 'tab', 'children': [
			{'tag': 'button', 'id': 'TabButton1', 'text': 'test 1'},
			{'tag': 'button', 'id': 'TabButton2', 'text': 'test 2'},
			{'tag': 'button', 'id': 'TabButton3', 'text': 'test 3'},
		]},
		{'tag': 'div', 'id': 'tabcontent1', 'style': 'display: block;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'text': 'test 1'},
		{'tag': 'div', 'id': 'tabcontent2', 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'text': 'test 2'},
		{'tag': 'div', 'id': 'tabcontent3', 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'text': 'test 3'},
	]},
	
];


export {HTMLlist, elemsList};