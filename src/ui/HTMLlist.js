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
		'Buttons': ['ButtonEditTerrain', 'ButtonTexture', 'TabEditorRoad'],
		'Contents': ['EditTerrainContent', 'TextureContent', 'EditorRoad'],
	},
	'DialogCreateTerrain': {
		'widjet': 'DialogCreateObject',
		'Options': ['WidthObject', 'LengthObject'],
		'Buttons': ['bDialogCreate', 'bDialogCancel'],
	},
	'DialogLoadHeightMap': {
		'widjet': 'DialogLoadHeightMap',
		'Buttons': ['bDialogLoadHeightMap', 'bDialogCancelHeightMap'],
		'File': 'MapFile',
	},
	'Pressuere': {
		'Options': ['EditRadius', 'EditStrength'],
		'Values': ['EditRadiusVal', 'EditStrengthVal'],
	},
	'Biomes': {
		'Options': [],
		'Values': [],
		'Buttons': ['bGenNoise', 'bNoiseApply'],
		'Canvas': 'CanvasGenNoise',
	},
	'Road': {
		'Options': ['CheckRoadPen'],
		'Values': [],
		'Buttons': ['RoadGenerate'],
	},
	'Camera': 'camera',
	'Wireframe': 'wireframe',
};

var HTMLlist = [
	// widjets
	{'tag': 'dialog', 'id':DataHTML.DialogCreateTerrain.widjet, 'children': [
		{'tag': 'form', 'id': 'f_createObject', 'method': 'dialog', 'children': [
			{'tag': 'h3', 'style': 'border-bottom: 1px solid white;', 'text': txt.CreateTerrain[0]},
			{'tag': 'div', 'class': 'd_body', 'text': txt.CreateTerrain[1], 'children': [
				{'tag': 'div', 'children': [
					{'tag': 'label', 'for': DataHTML.DialogCreateTerrain.Options[0], 'text': txt.CreateTerrain[2]},
					{'tag': 'input', 'id': DataHTML.DialogCreateTerrain.Options[0], 'style':"font-size: 12px; border: 0px; margin: 5px;width: 60px;", 'type': 'number', 'value': 100},
				]},
				{'tag': 'div', 'children': [
					{'tag': 'label', 'for': DataHTML.DialogCreateTerrain.Options[1], 'text': txt.CreateTerrain[3]},
					{'tag': 'input', 'id': DataHTML.DialogCreateTerrain.Options[1], 'style':"font-size: 12px; border: 0px; margin: 5px;width: 60px;", 'type': 'number', 'value': 100},
				]},
			]},
			{'tag': 'div', 'style': 'border-bottom: 1px solid white;', 'align': 'center', 'children': [
				{'tag': 'input', 'id': DataHTML.DialogCreateTerrain.Buttons[0], 'style': 'width: 120px;margin-right: 10px;', 'type': 'button', 'value': txt.CreateTerrain[4]},
				{'tag': 'input', 'id': DataHTML.DialogCreateTerrain.Buttons[1], 'style': 'width: 120px;margin-right: 10px;',  'type': 'button', 'value': txt.CreateTerrain[5]},
			]},
		]},
	]},
	{'tag': 'dialog', 'id': DataHTML.DialogLoadHeightMap.widjet, 'children': [
		{'tag': 'form', 'id': 'd_HeightMap', 'method': 'dialog', 'children': [
			{'tag': 'h3', 'style': 'border-bottom: 1px solid white;', 'text': txt.HeightMap[0]},
			{'tag': 'div', 'class': 'd_body', 'text': txt.HeightMap[1], 'children': [
				{'tag': 'div', 'children': [
					{'tag': 'label', 'text': txt.HeightMap[2]},
				]},
				{'tag': 'div', 'align': 'center', 'children': [
					{'tag': 'input', 'id': DataHTML.DialogLoadHeightMap.File, 'type':'file', 'style': 'margin-right: 20px;'},
				]},
			]},
			{'tag': 'div', 'style': 'border-bottom: 1px solid white;', 'align': 'center', 'children': [
				{'tag': 'input', 'id': DataHTML.DialogLoadHeightMap.Buttons[0], 'style': 'width: 120px;margin-right: 10px', 'type': 'button', 'value': txt.CreateTerrain[4]},
				{'tag': 'input', 'id': DataHTML.DialogLoadHeightMap.Buttons[1], 'style': 'width: 120px;margin-right: 10px',  'type': 'button', 'value': txt.CreateTerrain[5]},
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
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[0], 'class': ' active', 'text': txt.TabEditTerrain[0], 'name': DataHTML.RightBar.Contents[0], 'value': 0},
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[1], 'text': txt.TabEditBiomes[0], 'name': DataHTML.RightBar.Contents[1], 'value': 1},
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[2], 'text': txt.TabEditRoads[0], 'name': DataHTML.RightBar.Contents[2], 'value': 2},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[0], 'style': 'display: block;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'children': [
			{'tag': 'br'},
			{'tag': 'div', 'text': txt.TabEditTerrain[1]},
			{'tag': 'br'},
			{'tag': 'label', 'for': DataHTML.Pressuere.Options[0], 'text': txt.TabEditTerrain[2]},
			{'tag': 'br'},
			{'tag': 'input', 'id':DataHTML.Pressuere.Options[0], 'style':"font-size: 12px; border: 0px; margin: 5px;width: 270px;", 'type': 'range', 'value': 10, 'max': 50, 'min': 1},
			{'tag': 'div', 'id': DataHTML.Pressuere.Values[0], 'text': 10, 'align': 'center'},
			{'tag': 'br'},
			{'tag': 'label', 'for': DataHTML.Pressuere.Options[1], 'text': txt.TabEditTerrain[3]},
			{'tag': 'br'},
			{'tag': 'input', 'id': DataHTML.Pressuere.Options[1],  'style':"font-size: 12px; border: 0px; margin: 5px;width: 270px;", 'type': 'range', 'value': 5, 'max': 100, 'min': -100},
			{'tag': 'div', 'id': DataHTML.Pressuere.Values[1], 'text': 5, 'align': 'center'},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[1], 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none; text-align: center;', 'children': [
			{'tag': 'br'},
			{'tag': 'div', 'text': txt.TabEditBiomes[1]},
			{'tag': 'br'},
			{'tag': 'div', 'id': DataHTML.Biomes.Canvas},
			{'tag': 'br'},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[0], 'style':'text-align: center; width: 120px;', 'text': txt.TabEditBiomes[2]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[1], 'style':'text-align: center; width: 120px;', 'text': txt.TabEditBiomes[3]},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[2], 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'children': [
			{'tag': 'br'},
			{'tag': 'label', 'for': DataHTML.Road.Options[0], 'style':"font-size: 14px;", 'text':  txt.TabEditRoads[1]},
			{'tag': 'input', 'id': DataHTML.Road.Options[0], 'type': 'checkbox'},
			{'tag': 'br'},
			{'tag': 'button', 'id': DataHTML.Road.Buttons[0], 'style':'text-align: center; width: 120px;', 'text': txt.TabEditRoads[2]},
		]},
	]},
	{'tag': 'div', 'style': "position: absolute;top: 36px; right: 310px;", 'children': [
		{'tag': 'label', 'for': DataHTML.Camera, 'style':"font-size: 14px; color: #eee;", 'text': txt.Camera},
		{'tag': 'input', 'id': DataHTML.Camera, 'type': 'checkbox'},
	]},
	{'tag': 'div', 'style': "position: absolute;top: 60px; right: 310px;", 'children': [
		{'tag': 'label', 'for': DataHTML.Wireframe, 'style':"font-size: 14px; color: #eee;", 'text': 'WireFrame'},
		{'tag': 'input', 'id': DataHTML.Wireframe, 'type': 'checkbox'},
	]},
	
];


export {HTMLlist, DataHTML};