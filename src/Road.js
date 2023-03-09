/*
* @author lovepsone 2019 - 2021
*/

import * as THREE from './../libs/three.module.js';
import {COLORBOARDROAD, STEPSROAD, STEPSBOARDS, MINSIZEBOARD, MINSIZEROAD} from './CONST.js';

let DataRoad = {
	Size: [], // 0 - ROAD, 1 - BOARD
	Color: '',
	PointsExtrude: [],
	Mesh: {},
	StartPoint: {index: [], y : []},
	isDel: false
};
let Buffer = [];

let _CounterBox = 0, _boxes = [], _lines = [];
let _mesh = null, _camera = null, _scene = null;
let _mouseVector = new THREE.Vector2(), _raycaster = new THREE.Raycaster();
let _SizeRoad = MINSIZEROAD, _SizeBoard = MINSIZEBOARD;
const _colorBoard = new THREE.Color(COLORBOARDROAD);
let bindMouseDown, bindMouseMove;
let _brushMesh = null;

const WorldUVGenerator = {
	
	generateTopUV: function (geometry, vertices, indexA, indexB, indexC) {

		const a_x = vertices[indexA * 3];
		const a_y = vertices[indexA * 3 + 1];
		const b_x = vertices[indexB * 3];
		const b_y = vertices[indexB * 3 + 1];
		const c_x = vertices[indexC * 3];
		const c_y = vertices[indexC * 3 + 1];

		return [
			new THREE.Vector2( a_x, a_y ),
			new THREE.Vector2( b_x, b_y ),
			new THREE.Vector2( c_x, c_y )
		];
	},

	generateSideWallUV: function (geometry, vertices, indexA, indexB, indexC, indexD) {

		return ([
				new THREE.Vector2(0, 0),
				new THREE.Vector2(1, 0),
				new THREE.Vector2(1, 1),
				new THREE.Vector2(0, 1)
		]);
	}
};

class Road {

	constructor(viewObject, viewport, scene) {

        _camera = viewObject;
        _scene = scene;

		this.element = document.getElementById(viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);

		const brushSegments = [new THREE.Vector3(), new THREE.Vector3(0, 1, 0)];

		for (let i = 0; i < 50; i ++) {
	
			const nexti = i + 1;
			const x1 = Math.sin(2 * Math.PI * i / 50);
			const y1 = Math.cos(2 * Math.PI * i / 50);
			const x2 = Math.sin(2 * Math.PI * nexti / 50);
			const y2 = Math.cos(2 * Math.PI * nexti / 50);
			brushSegments.push(new THREE.Vector3(x1, 0, y1), new THREE.Vector3(x2, 0, y2));
		}

		_brushMesh = new THREE.LineSegments();
		_brushMesh.geometry.setFromPoints(brushSegments);
		_brushMesh.material.color.set(0xEC407A);
		_brushMesh.name = "BrushRoad";
		_brushMesh.visible = false;
		_scene.add(_brushMesh);
    }

	setTerrain(mesh) {

		_mesh = mesh;
	}

	setSize(val, type = 0) {

		switch(type) {
			case 0:
				_SizeRoad = val;
				break;
			case 1:
				_SizeBoard = val;
				break;
		}
	}

	setColorBroad(string) {

        switch(string) {

            case '44447a': _colorBoard.set(0x44447a); break;
            case 'a09077': _colorBoard.set(0xa09077); break;
            case '555555': _colorBoard.set(0x555555); break;
            case '888888': _colorBoard.set(0x888888); break;
            case 'bbbbaa': _colorBoard.set(0xbbbbaa); break;
            case 'dddde4': _colorBoard.set(0xdddde4); break;
            case 'c9d29b': _colorBoard.set(0xc9d29b); break;
            case '99aa77': _colorBoard.set(0x99aa77); break;
            case '88aa55': _colorBoard.set(0x99aa77); break;
            case '679459': _colorBoard.set(0x679459); break;
            case '448855': _colorBoard.set(0x448855); break;
            case 'd2b98b': _colorBoard.set(0xd2b98b); break;
            case '559944': _colorBoard.set(0x559944); break;
            case '337755': _colorBoard.set(0x337755); break;
        }
	}

	getDataRoads() {

		return Buffer;
	}

	getDataFile() {

		let tmp = [], countPoints = 0;

		for(let i = 0; i < Buffer.length; i++) {

			if (!Buffer[i].isDel) {

				countPoints +=  Buffer[i].PointsExtrude.length;
				tmp[i] = {
					point: Buffer[i].PointsExtrude,
					weightR: Buffer[i].Size[0],
					weightB: Buffer[i].Size[1],
					colorR: 0,
					colorB: 0,
					length: Buffer[i].PointsExtrude.length};
			}
		}

		tmp[tmp.length] = {length : countPoints};
		return tmp;
	}

	Select(id) {

		if (id < Buffer.length && !Buffer[id].isDel) {

			Buffer[id].Mesh.material.vertexColors = true;
			Buffer[id].Mesh.material.needsUpdate = true;
		}
	}

	UnSelect() {

		for (let i = 0; i < Buffer.length; i++) {

			if(Buffer[i].isDel) continue;
			Buffer[i].Mesh.material.vertexColors = false;
			Buffer[i].Mesh.material.needsUpdate = true;
		}
	}

	onDocumentMouseDown(event) {

		if (!(_mesh instanceof THREE.Mesh)) return;

        event.preventDefault();

        _mouseVector.x = (event.layerX / window.innerWidth) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight) * 2 + 1;

        _raycaster.setFromCamera(_mouseVector, _camera);

        let intersects = _raycaster.intersectObject(_mesh);

		if (intersects.length > 0) {

			_boxes.push(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: 0x00ff00, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5})));
            _boxes[_CounterBox].position.copy(intersects[0].point);
            _scene.add(_boxes[_CounterBox]);
			_CounterBox ++;

			if (_CounterBox > 1) {

				const v1 = new THREE.Vector3().copy(_boxes[_CounterBox - 2].position);
				const v2 = new THREE.Vector3().copy(_boxes[_CounterBox - 1].position);
				let geometry = new THREE.BufferGeometry().setFromPoints(new THREE.LineCurve3(v1, v2).getPoints(50));
				let material = new THREE.LineBasicMaterial({color : 0x00ff00});
				let line = new THREE.Line(geometry, material);
				_lines.push(line);
				_scene.add(line);
			}
        }
	}
	
	onDocumentMouseMove(event) {

		if (!(_mesh instanceof THREE.Mesh)) return;

		_mouseVector.x = (event.layerX / window.innerWidth) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight) * 2 + 1;

		_raycaster.setFromCamera(_mouseVector, _camera);
		_raycaster.firstHitOnly = true;

		const intersects = _raycaster.intersectObject(_mesh, true)[0];
		_brushMesh.visible = false;
        _brushMesh.scale.setScalar(1.5);

		if (intersects) {

			_brushMesh.position.copy(intersects.point);
            _brushMesh.visible = true;
		}
	}

	AddEvents() {

		this.element.addEventListener("mousedown", bindMouseDown, false);
		this.element.addEventListener("mousemove", bindMouseMove, false);
		_brushMesh.visible = true;
	}
	
	DisposeEvents() {

		this.element.removeEventListener("mousedown", bindMouseDown, false);
		this.element.removeEventListener("mousemove", bindMouseMove, false);
		_brushMesh.visible = false;
	}

	Draw(dataRoad) {

		const buff = dataRoad;
		const MaxBoards = buff.boards.length;
		const nonIndexHeightCount = buff.boards[MaxBoards - 1].length + buff.boards[MaxBoards - 2].length + buff.boards[MaxBoards - 3].length + buff.boards[MaxBoards - 4].length;
		const position = _mesh.geometry.getAttribute('position');
		const color = _mesh.geometry.getAttribute('color');
		const size = Math.sqrt(position.count);
		const bufPoints = position.clone();

		for (let i = 0; i < buff.vertex.length; i++) {

			Buffer[Buffer.length - 1].StartPoint.index.push(buff.index[i]);
			Buffer[Buffer.length - 1].StartPoint.y.push(bufPoints.getY(buff.index[i]));
			if (i < buff.vertex.length - nonIndexHeightCount) position.setY(buff.index[i], buff.vertex[i].y);
			color.setXYZ(buff.index[i],  _colorBoard.r, _colorBoard.g, _colorBoard.b);
		}

		const unique =[
			[... new Set(buff.boards[MaxBoards - 1])],
			[... new Set(buff.boards[MaxBoards - 2])],
			[... new Set(buff.boards[MaxBoards - 3])],
			[... new Set(buff.boards[MaxBoards - 4])],
			[... new Set(buff.boards[MaxBoards - 5])]
		];

		for (let i = 0; i < STEPSBOARDS; i++) this.SmoothBoard(unique, position, size);

		position.needsUpdate = true;
		color.needsUpdate = true;
	}

	SmoothBoard(indx, point, cout) {
		//    b
        // a --- c
        //    d
		for (let i = 0; i < indx.length - 1; i++) {

			for (let j = 0; j < indx[i].length; j++) {

				const a = point.getY(indx[i][j]);
				const b = point.getY(indx[i][j] - 1);
				const c = point.getY(indx[i][j] + 1);
				const d = point.getY(indx[i][j] + cout);
				const e = point.getY(indx[i][j] - cout);
				point.setY(indx[i][j], (0.5 * (a + b) + 0.5 * (a + c)) * 0.5);
				const f = point.getY(indx[i][j]);
				point.setY(indx[i][j], (0.5 * (f + d) + 0.5 * (f + e)) * 0.5);
			}
		}
	}

	Generate(wireframe, isBoxes = true, newPoint = []) {

		let points = [];

		if (isBoxes) {

			for (let i = 0; i < _boxes.length; i++) {

				DataRoad.PointsExtrude.push(new THREE.Vector3().copy(_boxes[i].position));
				points.push(new THREE.Vector3().copy(_boxes[i].position));
				_scene.remove(_boxes[i]);
				if (i < _lines.length) _scene.remove(_lines[i]);
			}
		} else {

			for (let i = 0; i < newPoint.length / 3; i++) {

				const tmp = new THREE.Vector3(
					newPoint[i * 3],
					newPoint[i * 3 + 1],
					newPoint[i * 3 + 2]);

				points.push(tmp);
			}
		}

		if (points.length == 0) {

			console.warn('Road.js: No direction points.');
			return;
		}

		let shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, _SizeRoad);
		//shape.moveTo(0, _SizeRoad);
		shape.lineTo(1.0, _SizeRoad);
		//shape.moveTo(0.1, _SizeRoad);
		shape.lineTo(1.0, 0);
		shape.lineTo(0, 0);

		DataRoad.Size[0] = _SizeRoad;
		DataRoad.Size[1] = _SizeBoard;
		DataRoad.Color = _colorBoard.getHexString();

		const extrudeSettings = {steps: STEPSROAD * points.length, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(points, false), UVGenerator: WorldUVGenerator};
		const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	
		let texture = new THREE.TextureLoader().load("texture/roads/asphalt2.jpg");
		texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

		DataRoad.Mesh = new THREE.Mesh(extrudeGeometry, new THREE.MeshPhongMaterial({map: texture, wireframe: wireframe}));
		Buffer.push(DataRoad);
		Buffer[Buffer.length - 1].Mesh.position.y += 0.09;
		_scene.add(Buffer[Buffer.length - 1].Mesh);

		DataRoad = {Size: [], Color: '', PointsExtrude: [], Mesh: {}, StartPoint: {index: [], y: []}, isDel: false};
		_boxes = [];
		_boxes.length = 0;
		_lines.length = 0;
		_CounterBox = 0;

		return {'points': _mesh.geometry.getAttribute('position'), 'ExtrudePoints': points, 'Size':[_SizeRoad, _SizeBoard]};
	}

	WireFrame(value = true) {

		if (Buffer.length > 0) {

			for (let i = 0; i < Buffer.length; i++) {

				if (Buffer[i].isDel) continue;
				Buffer[i].Mesh.material.wireframe = value;
			}
		}
	}

	Remove(id) {

		if (!Buffer[id].isDel) {

			_scene.remove(Buffer[id].Mesh);
			const position = _mesh.geometry.getAttribute('position');

			for (let i = 0; i < Buffer[id].StartPoint.index.length; i++) {

				position.setY(Buffer[id].StartPoint.index[i], Buffer[id].StartPoint.y[i]);
			}

			position.needsUpdate = true;
			Buffer[id].isDel = true;
			Buffer[id].Mesh = {};
			Buffer[id].Size = [];
			Buffer[id].Color = '';
			Buffer[id].PointsExtrude = [];
			Buffer[id].StartPoint = {index: [], y: []};
		}
	}

	RemoveAll() {

		if (Buffer.length > 0) {

			for (let i = 0; i < Buffer.length; i++) {

				_scene.remove(Buffer[i].Mesh);
			}

			Buffer = [];
		}
	}

	Count() {

		let count = 0;

		for(let i = 0; i < Buffer.length; i++)
			if (!Buffer[i].isDel) count++;

		return count;
	}
}

export {Road};