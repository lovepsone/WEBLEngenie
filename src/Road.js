/*
* author lovepsone
*/

import * as THREE from './../libs/three/Three.js';

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

let _worker = null

class Road {

	constructor(viewObject, terrain, viewport, scene) {

		_mesh = terrain;
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
    
	onDocumentMouseDown(event) {

        event.preventDefault();

        _mouseVector.x = (event.layerX / window.innerWidth ) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight ) * 2 + 1;

        _raycaster.setFromCamera(_mouseVector, _camera);

        let intersects = _raycaster.intersectObject(_mesh);

		if (intersects.length > 0) {

			_boxes.push( new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: 0x00ff00, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5})));
            _boxes[_CounterBox].position.copy(intersects[0].point);
            _scene.add(_boxes[_CounterBox]);
			_CounterBox++;

			if (_CounterBox > 1) {

				let v1 = new THREE.Vector3().copy(_boxes[_CounterBox - 2].position);
				let v2 = new THREE.Vector3().copy(_boxes[_CounterBox - 1].position);
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

		_mouseVector.x = (event.layerX / window.innerWidth ) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight ) * 2 + 1;
        
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

	WorkerOnMessage(e) {
		
	}


	Generate() {

		let points = [];
	
		for (let i = 0; i < _boxes.length; i++) {

			points.push(new THREE.Vector3().copy(_boxes[i].position));
			_scene.remove(_boxes[i]);

			if (i < _lines.length)
				_scene.remove(_lines[i]);
		}

		let extrudeSettings = {steps: 10 * _boxes.length, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(points, false)};

		let shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, 5);

		let mesh = new THREE.Mesh(new THREE.ExtrudeBufferGeometry(shape, extrudeSettings), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true /*map: texture*/}));
		_scene.add(mesh);
		_mesh.updateMatrix();
		mesh.updateMatrix();
	
		let _marr = _mesh.geometry.getAttribute('position');

		let _ray = new THREE.Raycaster();
		let _origin = new THREE.Vector3();
		let _direction = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0,-1, 0)];

		let buf = {
			vertex: [],
			index: [],
		};

		for (let i = 0; i < _marr.count; i++) {

			_origin.set(_marr.array[i*3], _marr.array[i*3+1], _marr.array[i*3+2]);

			for (let j = 0; j < _direction.length; j++) {

				_ray.set(_origin, _direction[j].normalize());
				let intersect = _ray.intersectObject(mesh);

				if (intersect.length > 0) {

					buf.vertex.push(intersect[0].point);
					buf.index.push(i);
				}
			}
		}

		for (let i = 0; i < _marr.count; i++) {

			for (let j = 0; j < buf.vertex.length; j++) {

				let tmp1 = new THREE.Vector2(_marr.array[i*3], _marr.array[i*3+2]);
				let tmp2 = new THREE.Vector2(buf.vertex[j].x, buf.vertex[j].z);

				if (tmp1.distanceTo(tmp2) < 3.5) {
		
					if (this.checkIndex(buf.index, i) === false) {

							buf.index.push(i);
							buf.vertex.push(buf.vertex[j]);
					}
				}
			}
		}
	
		for (let i = 0; i < buf.vertex.length; i++) {

			_marr.array[buf.index[i]*3+1] = buf.vertex[i].y;
			_marr.needsUpdate = true;
		}

		_boxes.length = 0;
		_lines.length = 0;
		_CounterBox = 0;
	}

	checkIndex(masIndexes, index) {

		for (let i = 0; i < masIndexes.length; i++) {

			if (masIndexes[i] === index)
				return true;
		}
		return false;
	}
}

export {Road};