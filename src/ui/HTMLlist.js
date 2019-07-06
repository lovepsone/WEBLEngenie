/*
* author lovepsone
*/

/*	style html :
*	{'tag': '', 'id': '', 'class': '', 'style': '', 'parent': '', 'text': '', .........}
*/

import {lang} 			from './../lang/lang.js';

var txt = lang['ru'];

var DataHTML = {
	'MenuBar': {'CreateTerrain': 'CreateTerrain', 'SaveTerrain': 'SaveTerrain', 'LoadTerrain': 'LoadTerrain', 'LoadHeightMap': 'LoadHeightMap'},
	'RightBar': {
		'Buttons': ['ButtonEditTerrain', 'TabButton2', 'TabButton3'],
		'Contents': ['EditTerrainContent', 'tabcontent2', 'tabcontent3'],
	},
	'DialogCreateTerrain': {
		'widjet': 'DialogCreateObject',
		'Options': ['WidthObject', 'LengthObject'],
		'Buttons': ['bDialogCreate', 'bDialogCancel'],
	},
	'Pressuere': {
		Options: ['EditRadius', 'EditStrength'],
		Values: ['EditRadiusVal', 'EditStrengthVal'],
	},
	'Camera': 'camera',
};

var HTMLlist = [
	// widjets
	{'tag': 'dialog', 'id':DataHTML.DialogCreateTerrain.widjet, 'children': [
		{'tag': 'form', 'id': 'f_createObject', 'method': 'dialog', 'children': [
			{'tag': 'h3', 'style': 'border-bottom: 1px solid white;', 'text': txt.CreateTerrain[0]},
			{'tag': 'div', 'class': 'd_body', 'text': txt.CreateTerrain[1], 'children': [
				{'tag': 'label', 'for': DataHTML.DialogCreateTerrain.Options[0], 'text': txt.CreateTerrain[2]},
				{'tag': 'input', 'id': DataHTML.DialogCreateTerrain.Options[0], 'style':"font-size: 12px; border: 0px; margin: 5px;width: 60px;", 'type': 'number', 'value': 100},
				{'tag': 'label', 'for': DataHTML.DialogCreateTerrain.Options[1], 'text': txt.CreateTerrain[3]},
				{'tag': 'input', 'id': DataHTML.DialogCreateTerrain.Options[1], 'style':"font-size: 12px; border: 0px; margin: 5px;width: 60px;", 'type': 'number', 'value': 100},
			]},
			{'tag': 'div', 'style': 'border-bottom: 1px solid white;', 'align': 'center', 'children': [
				{'tag': 'input', 'id': DataHTML.DialogCreateTerrain.Buttons[0], 'style': 'width: 200px;', 'type': 'button', 'value': txt.CreateTerrain[4]},
				{'tag': 'input', 'id': DataHTML.DialogCreateTerrain.Buttons[1], 'style': 'width: 200px;',  'type': 'button', 'value': txt.CreateTerrain[5]},
			]},
		]},
	]},
	// widjets
	{'tag': 'dialog', 'id': 'test', 'children': [
		{'tag': 'form', 'id': 'f_HeightMap', 'method': 'dialog', 'children': [
			{'tag': 'h3', 'style': 'border-bottom: 1px solid white;', 'text': txt.HeightMap[0]},
			{'tag': 'div', 'class': 'd_body', 'text': txt.HeightMap[1], 'children': [
				{'tag': 'label', 'text': txt.HeightMap[2]},
				{'tag': 'select', 'name': 'SizeHeightMap', 'children': [
					{'tag': 'option', 'value': '64', 'text': '64x64'},
					{'tag': 'option', 'value': '128', 'text': '128x128'},
					{'tag': 'option', 'value': '256', 'text': '256x256'},
					{'tag': 'option', 'value': '512', 'text': '512x512'},
					{'tag': 'option', 'value': '1024', 'text': '1024x1024'},
					{'tag': 'option', 'value': '2048', 'text': '2048x2048'},
				]},
				{'tag': 'label', 'text': txt.HeightMap[3]},
			]},/*
			{'tag': 'div', 'style': 'border-bottom: 1px solid white;', 'align': 'center', 'children': [
				{'tag': 'input', 'id': elemsList.ButtonList[0], 'style': 'width: 200px;', 'type': 'button', 'value': txt.CreateTerrain[4]},
				{'tag': 'input', 'id': elemsList.ButtonList[1], 'style': 'width: 200px;',  'type': 'button', 'value': txt.CreateTerrain[5]},
			]},*/
		]},
	]},
	//
	{'tag': 'div', 'id': 'Window'},
	// menu bar
	{'tag': 'div', 'id': 'menubar', 'children': [
		{'tag': 'div', 'class': 'menu', 'children': [
			{'tag': 'div', 'class': 'title', 'text': txt.MenuBar[0]},
			{'tag': 'div', 'class': 'options', 'children': [
				{'tag': 'div', 'id': DataHTML.MenuBar.CreateTerrain, 'class': 'option', 'text': txt.MenuBar[1]},
				{'tag': 'div', 'id': DataHTML.MenuBar.SaveTerrain, 'class': 'option', 'text': txt.MenuBar[2]},
				{'tag': 'div', 'id': DataHTML.MenuBar.LoadTerrain, 'class': 'option', 'text': txt.MenuBar[3]},
				{'tag': 'hr'},
				{'tag': 'div', 'id': DataHTML.MenuBar.LoadHeightMap, 'class': 'option', 'text': txt.MenuBar[4]},
			]},
		]},
	
	]},
	//side bar 
	{'tag': 'div', 'id': 'sidebar', 'children': [
		{'tag': 'div', 'id': 'tab', 'children': [
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[0], 'class': ' active', 'text': txt.TabEditTerrain[0]},
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[1], 'text': 'test 2'},
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[2], 'text': 'test 3'},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[0], 'style': 'display: block;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'children': [
			{'tag': 'br'},
			{'tag': 'div', 'text': txt.TabEditTerrain[1]},
			{'tag': 'br'},
			{'tag': 'label', 'for': DataHTML.Pressuere.Options[0], 'text': txt.TabEditTerrain[2]},
			{'tag': 'input', 'id':DataHTML.Pressuere.Options[0], 'style':"font-size: 12px; border: 0px; margin: 5px;width: 120px;", 'type': 'range', 'value': 1, 'max': 100, 'min': 1},
			{'tag': 'div', 'id': DataHTML.Pressuere.Values[0], 'text': 5, 'align': 'center'},
			{'tag': 'br'},
			{'tag': 'label', 'for': DataHTML.Pressuere.Options[1], 'text': txt.TabEditTerrain[3]},
			{'tag': 'input', 'id': DataHTML.Pressuere.Options[1],  'style':"font-size: 12px; border: 0px; margin: 5px;width: 120px;", 'type': 'range', 'value': 1, 'max': 100, 'min': -100},
			{'tag': 'div', 'id': DataHTML.Pressuere.Values[1], 'text': 5, 'align': 'center'},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[1], 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'text': 'test 2'},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[2], 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'text': 'test 3'},
	]},
	{'tag': 'div', 'style': "position: absolute;top: 36px; right: 310px;", 'children': [
		{'tag': 'label', 'for': DataHTML.Camera, 'style':"font-size: 14px; color: #eee;", 'text': txt.Camera},
		{'tag': 'input', 'id': DataHTML.Camera, 'type': 'checkbox'},
	]}
	
];


export {HTMLlist, DataHTML};