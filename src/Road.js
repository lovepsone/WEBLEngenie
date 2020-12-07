/*
* author lovepsone
*/

import * as THREE from './../libs/three.module.js';

let _CounterBox = 0
let _boxes = [];
let _lines = [];
let _mesh = null;
let _camera = null;
let _scene = null;
let _mouseVector = new THREE.Vector2();
let _raycaster = new THREE.Raycaster();

let bindMouseDown, bindMouseMove;
let _brushMesh = null;

const WorldUVGenerator = {
	
	generateTopUV: function (geometry, vertices, indexA, indexB, indexC) {

		const a_x = vertices[indexA * 3 ];
		const a_y = vertices[indexA * 3 + 1 ];
		const b_x = vertices[indexB * 3 ];
		const b_y = vertices[indexB * 3 + 1 ];
		const c_x = vertices[indexC * 3 ];
		const c_y = vertices[indexC * 3 + 1 ];

		return [
			new THREE.Vector2( a_x, a_y ),
			new THREE.Vector2( b_x, b_y ),
			new THREE.Vector2( c_x, c_y )
		];

	},

	generateSideWallUV: function (geometry, vertices, indexA, indexB, indexC, indexD) {

		const a_x = vertices[indexA * 3 ];
		const a_y = vertices[indexA * 3 + 1 ];
		const a_z = vertices[indexA * 3 + 2 ];
		const b_x = vertices[indexB * 3 ];
		const b_y = vertices[indexB * 3 + 1 ];
		const b_z = vertices[indexB * 3 + 2 ];
		const c_x = vertices[indexC * 3 ];
		const c_y = vertices[indexC * 3 + 1 ];
		const c_z = vertices[indexC * 3 + 2 ];
		const d_x = vertices[indexD * 3 ];
		const d_y = vertices[indexD * 3 + 1 ];
		const d_z = vertices[indexD * 3 + 2 ];

		if ( Math.abs(a_y - b_y) < 0.01 ) {

			return [
				new THREE.Vector2( a_x, 1 - a_z ),
				new THREE.Vector2( b_x, 1 - b_z ),
				new THREE.Vector2( c_x, 1 - c_z ),
				new THREE.Vector2( d_x, 1 - d_z )
			];

		} else {

			return [
				new THREE.Vector2( a_y, 1 - a_z ),
				new THREE.Vector2( b_y, 1 - b_z ),
				new THREE.Vector2( c_y, 1 - c_z ),
				new THREE.Vector2( d_y, 1 - d_z )
			];

		}

	}
};

class Road {

	constructor(viewObject, viewport, scene) {

        _camera = viewObject;
        _scene = scene;

		this.element = document.getElementById(viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);

		_brushMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), new THREE.MeshStandardMaterial({color: 0xEC407A, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5}));
        _brushMesh.name = "BrushRoad";
        _brushMesh.visible = false;
        _scene.add(_brushMesh);
    }

	setTerrain(mesh) {

		_mesh = mesh;
	}

	onDocumentMouseDown(event) {

        event.preventDefault();

        _mouseVector.x = (event.layerX / window.innerWidth) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight) * 2 + 1;

        _raycaster.setFromCamera(_mouseVector, _camera);

        let intersects = _raycaster.intersectObject(_mesh);

		if (intersects.length > 0) {

			_boxes.push( new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: 0x00ff00, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5})));
            _boxes[_CounterBox].position.copy(intersects[0].point);
            _scene.add(_boxes[_CounterBox]);
			_CounterBox++;

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

		event.preventDefault();

		_mouseVector.x = (event.layerX / window.innerWidth) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight) * 2 + 1;
        
		_raycaster.setFromCamera(_mouseVector, _camera);
		_raycaster.firstHitOnly = true;

		let intersects = _raycaster.intersectObject(_mesh);
		let bvh = _mesh.geometry.boundsTree;
        _brushMesh.scale.setScalar(1);

		if (intersects.length > 0) {

            _brushMesh.visible = true;
			_brushMesh.position.copy(intersects[0].point);
        } else {

            _brushMesh.visible = false;
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

		const test = new THREE.Color(0x44447a);

		const buff = dataRoad;
		let position = _mesh.geometry.getAttribute('position');
		let color = _mesh.geometry.getAttribute('color');

		for (let i = 0; i < buff.vertex.length; i++) {

			position.array[buff.index[i] * 3 + 1] = buff.vertex[i].y;
			position.needsUpdate = true;
			color.array[buff.index[i]*3] = test.r;
			color.array[buff.index[i]*3 + 1] = test.g;
			color.array[buff.index[i]*3 + 2] = test.b;
			color.needsUpdate = true;
		}
	}

	Generate() {

		let points = [];
	
		for (let i = 0; i < _boxes.length; i++) {

			points.push(new THREE.Vector3().copy(_boxes[i].position)/*_boxes[i].position*/);
			_scene.remove(_boxes[i]);

			if (i < _lines.length)
				_scene.remove(_lines[i]);
		}

		if (points.length == 0) {

			console.warn('Road.js: No direction points.');
			return;
		}
		let shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, 5);
		shape.moveTo(0, 5);
		shape.lineTo(0.5, 5);
		shape.moveTo(0.5, 5);
		shape.lineTo(0.5, 0);

		let extrudeSettings = {steps: 10 * points.length, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(points, false)/*, UVGenerator: WorldUVGenerator*/};
		let extrudeGeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
	
		let texture = new THREE.TextureLoader().load("texture/asphalt1_512.jpg");
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		let mesh = new THREE.Mesh(extrudeGeometry, new THREE.MeshBasicMaterial({map: texture, wireframe: false}));
		_scene.add(mesh);
		mesh.position.y += 0.05;

		_boxes.length = 0;
		_lines.length = 0;
		_CounterBox = 0;

		return {'points': _mesh.geometry.getAttribute('position'), 'ExtrudePoints': points};
	}
}

export {Road};