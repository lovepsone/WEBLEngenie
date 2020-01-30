/*
* author lovepsone
*/

import * as THREE from './../three/Three.js';

let _worker = null, _scene = null;

class CSGWorker {

    constructor(scene) {

        _worker = new Worker('./libs/CSG/CSGWorker.js', {type: 'module'}); './CSG.js'; // Works for Google Chrome v 80.0.3987.78 (beta)
        _worker.onmessage = this.WorkerOnMessage;
        _scene = scene;
    }

    Dispose() {

        _worker = null;
        _scene = null;
    }

    WorkerOnMessage(e) {

    }

    fromMesh(object) {

        if (object instanceof THREE.Mesh) {

            let matrix = object.matrix;
            if (object.geometry instanceof THREE.Geometry) {
                
                return {'faces': object.geometry.faces, 'vertices': object.geometry.vertices, 'faceVertexUvs': object.geometry.faceVertexUvs, 'matrix': matrix};
            }
            else {

                let geometry = new THREE.Geometry().fromBufferGeometry(object.geometry);
                return {'faces': geometry.faces, 'vertices': geometry.vertices, 'faceVertexUvs': geometry.faceVertexUvs, 'matrix': matrix};
            }
        }
        else throw 'CSG: The passed object is not THREE.Mesh';
    }

}

function union(a, b, scene) {

    let csgw = new CSGWorker(scene);
    let dataA = csgw.fromMesh(a), dataB = csgw.fromMesh(b);

    if (dataA !== undefined && dataB !== undefined) _worker.postMessage({'cmd': 'union', 'A': dataA, 'B': dataB});
}

function subtract(a, b, scene) {

    let csgw = new CSGWorker(scene);
    let dataA = csgw.fromMesh(a), dataB = csgw.fromMesh(b);

    if (dataA !== undefined && dataB !== undefined) _worker.postMessage({'cmd': 'union', 'A': dataA, 'B': dataB});
}

function intersect(a, b, scene) {

    let csgw = new CSGWorker(scene);
    let dataA = csgw.fromMesh(a), dataB = csgw.fromMesh(b);

    if (dataA !== undefined && dataB !== undefined) _worker.postMessage({'cmd': 'union', 'A': dataA, 'B': dataB});
}

export {union, subtract, intersect}