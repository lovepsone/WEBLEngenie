/*
* author lovepsone
*/
let _mesh = null, _pressure = null, _scope = null, _ImageLoader = null;
let _depth = 64, _width = 64;
let _spacingX = 2, _heightOffset = 2.5, _spacingZ = 2;
let _context;

import {PressureTerrain} from './PressureTerrain.js';

class Terrain {

	constructor(scope) {

		_scope = scope;
	}

	Create(_width, _height) {

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(_mesh);
			_mesh = null;
			_pressure.DisposeEvents();
			_pressure = null;

		}

		let geometry = new THREE.PlaneBufferGeometry(_width, _height, _width, _height);
		geometry.rotateX(-Math.PI / 2);
		geometry.computeBoundingBox();
		geometry.center();
		geometry.computeFaceNormals();

		_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x0000ff, /*wireframe: true,*/ side: THREE.DoubleSide/*, morphTargets: true*/}));
		_mesh.name = 'Terrain';
		_mesh.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true })));

		_scope.scene.add(_mesh);

		_pressure = new PressureTerrain(_scope.camera, _mesh, 'Window');
		_pressure.AddEvents();
	}

	LoadHeightMap(patch, depth = 128, width = 128) {

		if (_mesh instanceof THREE.Mesh) {

			_scope.scene.remove(_mesh);
			_mesh = null;
			_pressure.DisposeEvents();
			_pressure = null;

		}
	
		_ImageLoader = new THREE.ImageLoader();
		_depth = depth;
		_width = width;
		
		let canvas = document.createElement('canvas');
		canvas.width = _width;
		canvas.height = _depth;
		_context = canvas.getContext('2d');

		_ImageLoader.load(patch, this.onLoadHeightMap);
	}

	onLoadHeightMap(image) {

		_context.drawImage(image, 0, 0);
    	let pixel = _context.getImageData(0, 0, _width, _depth);
    	let geom = new THREE.Geometry;

        for (let x = 0; x < _depth; x++) {

            for (let z = 0; z < _width; z++) {

                var vertex = new THREE.Vector3(x * _spacingX, pixel.data[z * 4 + (_depth * x * 4)] / _heightOffset, z * _spacingZ);
                geom.vertices.push(vertex);
            }
        }

            // we create a rectangle between four vertices, and we do
            // that as two triangles.
            for (var z = 0; z < _depth - 1; z++) {
                for (var x = 0; x < _width - 1; x++) {
                    // we need to point to the position in the array
                    // a - - b
                    // |  x  |
                    // c - - d
                    var a = x + z * _width;
                    var b = (x + 1) + (z * _width);
                    var c = x + ((z + 1) * _width);
                    var d = (x + 1) + ((z + 1) * _width);
                    var face1 = new THREE.Face3(a, b, d);
                    var face2 = new THREE.Face3(d, c, a);
                    geom.faces.push(face1);
                    geom.faces.push(face2);
                }
            }

            geom.computeVertexNormals(true);
            geom.computeFaceNormals();
            geom.computeBoundingBox();
            geom.applyMatrix( new THREE.Matrix4().makeTranslation(-geom.boundingBox.max.x /2, 0, -geom.boundingBox.max.z/2) );


			_mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide, morphTargets: true}));
			_mesh.add(new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true })));

    		_scope.scene.add(_mesh);
	}

	setPressureRadius(r) {

		if (_pressure instanceof PressureTerrain) {

			_pressure.UpdateRadius(r);
		}
	}


	setPressureStrength(s) {

		if (_pressure instanceof PressureTerrain) {

			_pressure.UpdateStrength(s);
		}
	}

	PressureDisposeEvents() {

		if (_pressure instanceof PressureTerrain) {

			_pressure.DisposeEvents();
		}
	}

	PressureUpdateEvents() {

		if (_pressure instanceof PressureTerrain) {

			_pressure.AddEvents();
		}
	}	
}

export {Terrain};