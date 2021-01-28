/*
* @author lovepsone 2019 - 2021
*/

import * as THREE from '../libs/three.module.js';
import {sphereIntersectTriangle} from './../libs/BVH/Utils/MathUtilities.js';

let _canvas = document.createElement('canvas'), _ctx = null;
let _width = 128, _height = 128, _matrix = [];

let _ColorsCanvas = document.createElement('canvas');

let bindMouseDown, bindMouseUp, bindMouseMove;
let _brushMesh = null, _camera = null, _scene = null, _mesh = null;
let _mouseVector = new THREE.Vector2();
let _raycaster = new THREE.Raycaster();
let _MouseDown = false;
let _ColorPen = new THREE.Color(0x44447a);
let _radius = 0.1;

class GenerateBiomeMap {

    constructor(viewObject, viewport, scene, elemId = 'TerrainMap') {
        _camera = viewObject;
        _scene = scene;
    
		this.element = document.getElementById(viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);
        bindMouseUp = this.onDocumentMouseUp.bind(this);

		_brushMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), new THREE.MeshStandardMaterial({color: 0xEC407A, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5}));
        _brushMesh.name = "BrushRoad";
        _brushMesh.visible = false;

        _scene.add(_brushMesh);

        _ColorsCanvas.width = _width;
        _ColorsCanvas.height = _height*5;
        _ColorsCanvas.style.width = "256px";
        _ColorsCanvas.style.height = "1280px";
        //document.getElementById(elemId).appendChild(_ColorsCanvas);  

        _canvas.width = _width;
        _canvas.height = _height;
        _canvas.style.width = "256px";
        _canvas.style.height = "256px";
        _ctx = _canvas.getContext('2d');
        document.getElementById(elemId).appendChild(_canvas);
        this.setSize(128, 128);
    }

	setTerrain(mesh) {

		_mesh = mesh;
    }

    setColor(string) {

        switch(string) {

            case '44447a': _ColorPen.set(0x44447a); break;
            case 'a09077': _ColorPen.set(0xa09077); break;
            case '555555': _ColorPen.set(0x555555); break;
            case '888888': _ColorPen.set(0x888888); break;
            case 'bbbbaa': _ColorPen.set(0xbbbbaa); break;
            case 'dddde4': _ColorPen.set(0xdddde4); break;
            case 'c9d29b': _ColorPen.set(0xc9d29b); break;
            case '99aa77': _ColorPen.set(0x99aa77); break;
            case '88aa55': _ColorPen.set(0x99aa77); break;
            case '679459': _ColorPen.set(0x679459); break;
            case '448855': _ColorPen.set(0x448855); break;
            case 'd2b98b': _ColorPen.set(0xd2b98b); break;
            case '559944': _ColorPen.set(0x559944); break;
            case '337755': _ColorPen.set(0x337755); break;
        }
    }

	onDocumentMouseDown(event) {

		event.preventDefault();
		_MouseDown = true;
	}

	onDocumentMouseUp(event) {

		event.preventDefault();
		_MouseDown = false;
	}

    onDocumentMouseMove(event) {

        if (!(_mesh instanceof THREE.Mesh)) {

            console.warn('GenerateBiomeMap.js: Create geometry before overlaying color.');
            return;
        }

		event.preventDefault();

		_mouseVector.x = (event.layerX / window.innerWidth) * 2 - 1;
        _mouseVector.y = - (event.layerY / window.innerHeight) * 2 + 1;
        _raycaster.setFromCamera(_mouseVector, _camera);
		_raycaster.firstHitOnly = true;

		let intersects = _raycaster.intersectObject(_mesh);
		let bvh = _mesh.geometry.boundsTree;
		_brushMesh.scale.setScalar(_radius);
        _brushMesh.visible = false;

		if (intersects.length > 0) {

			_brushMesh.position.copy(intersects[0].point);
            _brushMesh.visible = true;

			if (_MouseDown) {

				const indices = [];
				const sphere = new THREE.Sphere(_brushMesh.position, _radius);
                let colorAttr = _mesh.geometry.getAttribute('color');
				const indexAttr =_mesh.geometry.index;

				bvh.shapecast(_mesh, box => sphere.intersectsBox(box), (tri, a, b, c) => 
				{
					
					if (sphereIntersectTriangle(sphere, tri)) {

						indices.push(a, b, c);
					}
	
					return false;
	
				});
				
				for (let i = 0, l = indices.length; i < l; i ++ ) {

                    const index = indexAttr.getX(indices[i]);
                    colorAttr.setX(index, _ColorPen.r);
                    colorAttr.setY(index, _ColorPen.g);
                    colorAttr.setZ(index, _ColorPen.b);
                    const x = index % _width;
                    const y = Math.floor(index/_width);
                    _ctx.fillStyle = '#' + _ColorPen.getHexString();
                    _ctx.fillRect(x, y, 1, 1);    
				}
				colorAttr.needsUpdate = true;
			}
		}
    }

	UpdateRadius(r) {

		_radius  = r / 5.0;
    }

	AddEvents() {

		this.element.addEventListener("mousedown", bindMouseDown, false);
        this.element.addEventListener("mousemove", bindMouseMove, false);
        this.element.addEventListener("mouseup", bindMouseUp, false);
        _mesh.geometry.computeBoundsTree();
	}
	
	DisposeEvents() {

		this.element.removeEventListener("mousedown", bindMouseDown, false);
        this.element.removeEventListener("mousemove", bindMouseMove, false);
        this.element.removeEventListener("mouseup", bindMouseUp, false);
		_brushMesh.visible = false;
    }

    setSize(width, height) {

        _ColorsCanvas.width = width;
        _ColorsCanvas.height = height*5;
        _ColorsCanvas.getContext('2d').clearRect(0, 0, width,  height*5);
        _ColorsCanvas.getContext('2d').fillStyle = '#ffff00';
        _ColorsCanvas.getContext('2d').fillRect(0, 0, width,  height*5);
    
        _ctx.clearRect(0, 0, _width, _height);
        _width = width;
        _height = height;
        _canvas.width = _width;
        _canvas.height =  _height;
        _ctx.fillStyle = '#555';
        _ctx.fillRect(0, 0, _width, _height);

        _matrix = [];
        
        for(let i = 0; i < _width; i++) {

            _matrix.push([]);

            for(let j = 0; j < _height; j++) {

                _matrix[i].push('');
            }
        }
    }

    GenerateMap(colors, x, y) {

        let buf = '#';
        const w = Number.parseInt(_width), h = Number.parseInt(_height);
        // 3 канала r, g, b
        buf += (colors == '44447a') ? '00': 'ff'; //OCEAN
        buf += (colors == 'a09077') ? '00': 'ff'; //BEACH
        buf += (colors == '555555') ? '00': 'ff'; //SCORCHED
        _ColorsCanvas.getContext('2d').fillStyle = buf;
        _ColorsCanvas.getContext('2d').fillRect(x, h - (y + 1), 1, 1);

        buf = '#';
        buf += (colors == '888888') ? '00': 'ff'; //BARE
        buf += (colors == 'bbbbaa') ? '00': 'ff'; //TUNDRA
        buf += (colors == 'dddde4') ? '00': 'ff'; //SNOW
        _ColorsCanvas.getContext('2d').fillStyle = buf;
        _ColorsCanvas.getContext('2d').fillRect(x, h*2 - (y + 1), 1, 1);

        buf = '#';
        buf += (colors == 'c9d29b') ? '00': 'ff'; //TEMPERATE_DESERT
        buf += (colors == '99aa77') ? '00': 'ff'; //TAIGA
        buf += (colors == '88aa55') ? '00': 'ff'; //GRASSLAND
        _ColorsCanvas.getContext('2d').fillStyle = buf;
        _ColorsCanvas.getContext('2d').fillRect(x, h*3 - (y + 1), 1, 1);

        buf = '#';
        buf += (colors == '679459') ? '00': 'ff'; //TEMPERATE_DECIDUOUS_FOREST
        buf += (colors == '448855') ? '00': 'ff'; //TEMPERATE_RAIN_FOREST
        buf += (colors == 'd2b98b') ? '00': 'ff'; //SUBTROPICAL_DESERT
        _ColorsCanvas.getContext('2d').fillStyle = buf;   
        _ColorsCanvas.getContext('2d').fillRect(x, h*4 - (y + 1), 1, 1);

        buf = '#';
        buf += (colors == '559944') ? '00': 'ff'; //TROPICAL_SEASONAL_FOREST
        buf += (colors == '337755') ? '00': 'ff'; //TROPICAL_RAIN_FOREST
        buf += 'ff'; // none
        _ColorsCanvas.getContext('2d').fillStyle = buf;
        _ColorsCanvas.getContext('2d').fillRect(x, h*5 - (y + 1), 1, 1);
    }

    getMapColors() {

        return {colors: _ColorsCanvas, w: _width, h:_height};
    }

    setColorsDataBiomes(array) {

        let x = 0, y = 0;

        for (let i = 0; i < array.count; i++) {

            const color = new THREE.Color(
                array.array[i * 3 + 0],
                array.array[i * 3 + 1],
                array.array[i * 3 + 2]
            );

            if (i % _width == 0 && i != 0) {

                y++;
                x = 0;
            }
    
            _matrix[y][x] = color.getHexString();
            this.GenerateMap(_matrix[y][x], x, y);
            _ctx.fillStyle = '#' + _matrix[y][x];
            _ctx.fillRect(x, y, 1, 1);
            x++;
        }
    }
}

export {GenerateBiomeMap};