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

		let data = e.data;

		if (data.cmd === 'generated') {

			let buff = data.dataRoad;
			let position = _mesh.geometry.getAttribute('position');
			let color = _mesh.geometry.getAttribute('color');

			for (let i = 0; i < buff.vertex.length; i++) {

				position.array[buff.index[i]*3+1] = buff.vertex[i].y;
				position.needsUpdate = true;

				if (buff.color[i] === 0) {

					color.array[buff.index[i]*3] = 0;
					color.array[buff.index[i]*3 + 1] = 0;
					color.array[buff.index[i]*3 + 2] = 0;
					color.needsUpdate = true;
				} else {

					color.array[buff.index[i]*3] = 1;
					color.array[buff.index[i]*3 + 1] = 1;
					color.array[buff.index[i]*3 + 2] = 1;
					color.needsUpdate = true;
				}
			}

			_worker.terminate();
			_worker = null;
		}
	}


	Generate() {

		let points = [];
	
		for (let i = 0; i < _boxes.length; i++) {

			points.push(new THREE.Vector3().copy(_boxes[i].position));
			_scene.remove(_boxes[i]);

			if (i < _lines.length)
				_scene.remove(_lines[i]);
		}
		
		_worker = new Worker('./src/WorkerRoad.js', {type: 'module'});
		_worker.onmessage = this.WorkerOnMessage;
		_worker.postMessage({'cmd': 'generate', 'points': _mesh.geometry.getAttribute('position'), 'ExtrudePoints':points});

		_boxes.length = 0;
		_lines.length = 0;
		_CounterBox = 0;
	}
}

export {Road};