/*
* @author lovepsone 2019 - 2021
*/

/*	style html :
*	{'tag': '', 'id': '', 'class': '', 'style': '', 'parent': '', 'text': '', .........}
*/

import {lang} 			from './../lang/lang.js';
import {CLASSTULLTIP, TOOLTIPWIND}	from './../CONST.js';

var txt = lang['ru'];

var DataHTML = {
	'MenuBar': {'CreateTerrain': 'CreateTerrain',
			'SaveTerrain': 'SaveTerrain',
			'LoadTerrain': 'LoadTerrain',
			'LoadHeightMap': 'LoadHeightMap',
			'RoughnessHeightMap': 'RoughnessHeightMap',
			'PlaySimulation': 'PlaySimulation',
			'NoisePerlin': 'NoisePerlin',
			'DiamondSquare': 'DiamondSquare',
		},
	'RightBar': {
		'Buttons': ['TabEditorTerrain', 'TabEditorBiomes', 'TabEditorRoads', 'TabEditorTextures'],
		'Contents': ['EditorTerrainContent', 'EditorBiomesContent', 'EditorRoadsContent', 'EditorTexturesContent'],
	},
	'DialogCreateTerrain': {
		'widjet': 'DialogCreateObject',
		'Options': ['SizeTerrain'],
		'Buttons': ['bDialogCreate', 'bDialogCancel'],
	},
	'DialogLoadHeightMap': {
		'widjet': 'DialogLoadHeightMap',
		'Buttons': ['bDialogLoadHeightMap', 'bDialogCancelHeightMap'],
		'File': 'MapFile',
	},
	'Pressuere': {
		'Options': ['EditStrength'],
		'Values': ['EditStrengthVal'],
	},
	'Biomes': {
		'Options': [],
		'Values': [],
		'Buttons': ['bGenNoise', 'bNoiseApply',
			'bOcean', 'bBeach', 'bScorched',
			'bBare', 'bTundra', 'bSnow',
			'bTemperateDesert', 'bTaiga', 'bGrassLand',
			'bTemperateDeciduousForest', 'bTemperateRainForest', 'bSubtropicalDesert',
			'bTropicalSeasonalForest', 'bTropicalRainForest'
		],
		'Canvas': 'CanvasGenNoise',
	},
	'Road': {
		'Options': [],
		'Values': [],
		'Buttons': ['RoadGenerate'],
	},
	'Texture': {
		'Options': ['sOcean', 'sBeach', 'sScorched',
			'sBare', 'sTundra', 'sSnow',
			'sTemperateDesert', 'sTaiga', 'sGrassLand',
			'sTemperateDeciduousForest', 'sTemperateRainForest', 'sSubtropicalDesert',
			'sTropicalSeasonalForest', 'sTropicalRainForest'],
		'Values': ['vOcean', 'vBeach', 'vScorched',
			'vBare', 'vTundra', 'vsSnow',
			'vTemperateDesert', 'vTaiga', 'vGrassLand',
			'vTemperateDeciduousForest', 'vTemperateRainForest', 'vSubtropicalDesert',
			'vTropicalSeasonalForest', 'vTropicalRainForest'],
		'Buttons': ['bTextureApply'],
	},
	'Camera': 'camera',
	'Brush': 'brush',
	'SizeBrush': 'sizebrush',
	'ValBrush': 'valbrush',
	'Wireframe': 'wireframe',
	'ValRoughnessHeightMap': 'valRoughnessHeightMap',
};
const StyleIconLoadTexture = "outline:0;opacity:0;pointer-events:none;user-select:none";
const StyleIconLabelTexture = "position:static;width:80px;height:80px;font-size: 10px;color:white;display:inline-block;cursor:pointer;text-align:center;background-size:100%;";
const cssToolTip = "width:240px;height:240px;font-size:20px;color:white;background:inherit;border:4px outset white;border-radius:5px;";

let HTMLlist = [
	// widjets
	{'tag': 'dialog', 'id':DataHTML.DialogCreateTerrain.widjet, 'children': [
		{'tag': 'form', 'id': 'f_createObject', 'method': 'dialog', 'children': [
			{'tag': 'h3', 'style': 'border-bottom: 1px solid white;', 'text': txt.CreateTerrain[0]},
			{'tag': 'div', 'class': 'd_body', 'text': txt.CreateTerrain[1], 'children': [
			]},
			{'tag': 'div', 'align': 'center', 'children': [
				{'tag':'select', 'id': DataHTML.DialogCreateTerrain.Options[0], 'style':"font-size: 14px; border: 0px; margin: 5px;width: 200px;", 'name': DataHTML.DialogCreateTerrain.Options[0], 'children': [
					{'tag': 'option', 'value': '64', 'text': 'size: 64x64'},
					{'tag': 'option', 'value': '128', 'text': 'size: 128x128'},
					{'tag': 'option', 'value': '256', 'text': 'size: 256x256'},
					{'tag': 'option', 'value': '512', 'text': 'size: 512x512'},
					{'tag': 'option', 'value': '1024', 'text': 'size: 1024x1024'}
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
					{'tag': 'input', 'id': DataHTML.DialogLoadHeightMap.File, 'type':'file', 'style':"font-size: 12px; border: 0px; margin: 5px;width: 200px;"},
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
			{'tag': 'div', 'class': 'options', 'style':'width: 140px;', 'children': [
				{'tag': 'div', 'id': DataHTML.MenuBar.CreateTerrain, 'class': 'option', 'text': txt.MenuBar[1]},
				{'tag': 'div', 'id': DataHTML.MenuBar.SaveTerrain, 'class': 'option', 'text': txt.MenuBar[2]},
				{'tag': 'div', 'id': DataHTML.MenuBar.LoadTerrain, 'class': 'option', 'text': txt.MenuBar[3]},
				//{'tag': 'hr'},
			]},
		]},
		//simulate
		{'tag': 'div', 'class': 'menu', 'children': [
			{'tag': 'div', 'class': 'title', 'text': "simulation"},
			{'tag': 'div', 'class': 'options', 'style':'width: 140px;', 'children': [
				{'tag': 'div', 'id': DataHTML.MenuBar.PlaySimulation, 'class': 'option', 'text': "Play"},
			]},
		]},
		// height maps
		{'tag': 'div', 'class': 'menu', 'children': [
			{'tag': 'div', 'class': 'title', 'text': txt.MenuBar[4]},
			{'tag': 'div', 'class': 'options', 'style':'width: 200px;', 'children': [
				{'tag': 'div', 'id': DataHTML.MenuBar.LoadHeightMap, 'class': 'option', 'text': txt.MenuBar[6]},
				{'tag': 'div', 'id': DataHTML.MenuBar.NoisePerlin, 'class': 'option', 'text': txt.MenuBar[7]},
				{'tag': 'div', 'id': DataHTML.MenuBar.DiamondSquare, 'class': 'option', 'text': txt.MenuBar[8]},
				{'tag': 'div', 'id': DataHTML.MenuBar.RoughnessHeightMap, 'class': 'option', 'text': txt.MenuBar[5], 'children': [
					{'tag': 'input', 'id': DataHTML.ValRoughnessHeightMap, 'type': 'range', 'min': -100, 'max': 100, 'value': 40, 'style':'width: 180px;'}
				]},
			]},
		]},
	
	]},
	//side bar 
	{'tag': 'div', 'id': 'sidebar', 'children': [
		{'tag': 'div', 'id': 'tab', 'children': [
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[0], 'class': ' active', 'text': txt.TabEditTerrain[0], 'name': DataHTML.RightBar.Contents[0], 'value': 0},
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[1], 'text': txt.TabEditBiomes[0], 'name': DataHTML.RightBar.Contents[1], 'value': 1},
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[2], 'text': txt.TabEditRoads[0], 'name': DataHTML.RightBar.Contents[2], 'value': 2},
			{'tag': 'button', 'id': DataHTML.RightBar.Buttons[3], 'text': txt.TabEditTexture[0], 'name': DataHTML.RightBar.Contents[3], 'value': 3},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[0], 'style': 'display: block;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'children': [
			{'tag': 'br'},
			{'tag': 'div', 'text': txt.TabEditTerrain[1]},
			{'tag': 'br'},
			{'tag': 'label', 'for': DataHTML.Pressuere.Options[0], 'text': txt.TabEditTerrain[3]},
			{'tag': 'br'},
			{'tag': 'input', 'id': DataHTML.Pressuere.Options[0],  'style':"font-size: 12px; border: 0px; margin: 5px;width: 270px;", 'type': 'range', 'value': 5, 'max': 100, 'min': -100},
			{'tag': 'div', 'id': DataHTML.Pressuere.Values[0], 'text': 5, 'align': 'center'},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[1], 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none; text-align: center;', 'children': [
			{'tag': 'br'},
			{'tag': 'div', 'text': txt.TabEditBiomes[1]},
			{'tag': 'br'},
			{'tag': 'div', 'id': DataHTML.Biomes.Canvas},
			{'tag': 'br'},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[0], 'style':'text-align: center; width: 120px;', 'text': txt.TabEditBiomes[2]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[1], 'style':'text-align: center; width: 120px;', 'text': txt.TabEditBiomes[3]},
			{'tag': 'hr'},
			{'tag': 'br'},
			{'tag': 'div', 'text': txt.TabEditBiomes[4]},
			{'tag': 'br'},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[2], 'class':'44447a', 'style':'text-align: center; width: 220px; background: #44447a;', 'text': txt.TabEditBiomes[5]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[3], 'class':'a09077','style':'text-align: center; width: 220px; background: #a09077;', 'text': txt.TabEditBiomes[6]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[4], 'class':'555555','style':'text-align: center; width: 220px; background: #555555;', 'text': txt.TabEditBiomes[7]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[5], 'class':'888888','style':'text-align: center; width: 220px; background: #888888;', 'text': txt.TabEditBiomes[8]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[6], 'class':'bbbbaa','style':'text-align: center; width: 220px; background: #bbbbaa;', 'text': txt.TabEditBiomes[9]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[7], 'class':'dddde4','style':'text-align: center; width: 220px; background: #dddde4;', 'text': txt.TabEditBiomes[10]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[8], 'class':'c9d29b','style':'text-align: center; width: 220px; background: #c9d29b;', 'text': txt.TabEditBiomes[11]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[9], 'class':'99aa77','style':'text-align: center; width: 220px; background: #99aa77;', 'text': txt.TabEditBiomes[12]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[10], 'class':'88aa55','style':'text-align: center; width: 220px; background: #88aa55;', 'text': txt.TabEditBiomes[13]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[11], 'class':'679459','style':'text-align: center; width: 220px; background: #679459;', 'text': txt.TabEditBiomes[14]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[12], 'class':'448855','style':'text-align: center; width: 220px; background: #448855;', 'text': txt.TabEditBiomes[15]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[13], 'class':'d2b98b','style':'text-align: center; width: 220px; background: #d2b98b;', 'text': txt.TabEditBiomes[16]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[14], 'class':'559944','style':'text-align: center; width: 220px; background: #559944;', 'text': txt.TabEditBiomes[17]},
			{'tag': 'button', 'id': DataHTML.Biomes.Buttons[15], 'class':'337755','style':'text-align: center; width: 220px; background: #337755;', 'text': txt.TabEditBiomes[18]},
			{'tag': 'hr'},
			{'tag': 'br'},
			{'tag': 'div', 'text': 'Result Biomes Map'},
			{'tag': 'div', 'id': 'TerrainMap'},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[2], 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none;', 'children': [
			{'tag': 'br'},
			{'tag': 'button', 'id': DataHTML.Road.Buttons[0], 'style':'text-align: center; width: 120px;', 'text': txt.TabEditRoads[2]},
		]},
		{'tag': 'div', 'id': DataHTML.RightBar.Contents[3], 'style': 'display: none;padding: 6px 12px;border: 1px solid #888;border-top: none; text-align: center;', 'children': [
			{'tag': 'br'},
			{'tag': 'div', 'text': txt.TabEditTexture[1]},
			{'tag': 'br'},
			{'tag': 'label', 'id': DataHTML.Texture.Values[0], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[2], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[0], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[2]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[1], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[3], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[1], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[3]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[2], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[4], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[2], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[4]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[3], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[5], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[3], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[5]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[4], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[6], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[4], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[6]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[5], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[7], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[5], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[7]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[6], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[8], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[6], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[8]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[7], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[9], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[7], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[9]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[8], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[10], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[8], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[10]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[9], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[11], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[9], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[11]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[10], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[12], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[10], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[12]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[11], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[13], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[11], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[13]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[12], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[14], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[12], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[14]},
			]},
			{'tag': 'label', 'id': DataHTML.Texture.Values[13], 'class': CLASSTULLTIP, 'style': StyleIconLabelTexture, 'text': txt.TabEditTexture[15], 'children': [
				{'tag': 'input', 'id': DataHTML.Texture.Options[13], 'type':'file', 'style': StyleIconLoadTexture},
				{'tag': 'span', 'data-tooltip-css': cssToolTip, 'class': TOOLTIPWIND, text: txt.TabEditTexture[15]},
			]},
			{'tag': 'br'},
			{'tag': 'br'},
			{'tag': 'button', 'id': DataHTML.Texture.Buttons[0], 'style':'text-align: center; width: 120px;', 'text': txt.TabEditTexture[16]},
			
		]},
	]},
	{'tag': 'div', 'style': "position: absolute;top: 36px; right: 310px;", 'children': [
		{'tag': 'label', 'for': DataHTML.SizeBrush, 'style':"font-size: 14px; color: #eee;", 'text': txt.SizeBrush},
		{'tag': 'label', 'id': DataHTML.ValBrush, 'for': DataHTML.SizeBrush, 'style':"font-size: 14px; color: #eee;", 'text': '10'},
		{'tag': 'input', 'id': DataHTML.SizeBrush, 'type': 'range', 'style':"width: 200px;",'value': 10, 'max': 100, 'min': 1},
	]},
	{'tag': 'div', 'style': "position: absolute;top: 60px; right: 310px;", 'children': [
		{'tag': 'label', 'for': DataHTML.Brush, 'style':"font-size: 14px; color: #eee;", 'text': txt.Brush},
		{'tag': 'input', 'id': DataHTML.Brush, 'type': 'checkbox'},
	]},
	{'tag': 'div', 'style': "position: absolute;top: 84px; right: 310px;", 'children': [
		{'tag': 'label', 'for': DataHTML.Camera, 'style':"font-size: 14px; color: #eee;", 'text': txt.Camera},
		{'tag': 'input', 'id': DataHTML.Camera, 'type': 'checkbox'},
	]},
	{'tag': 'div', 'style': "position: absolute;top: 108px; right: 310px;", 'children': [
		{'tag': 'label', 'for': DataHTML.Wireframe, 'style':"font-size: 14px; color: #eee;", 'text': 'WireFrame'},
		{'tag': 'input', 'id': DataHTML.Wireframe, 'type': 'checkbox'},
	]},
];

export {HTMLlist, DataHTML};