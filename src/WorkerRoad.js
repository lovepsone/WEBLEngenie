/*
* author lovepsone
*/

import * as THREE from './../libs/three/Three.js';


function GenerateRoad(points, ExtrudePoints) {

    let buff = {
        vertex: [],
        index: [],
        color: []
    };

    let _ExtrudePoints = [];

    for (let i = 0; i < ExtrudePoints.length; i++) {

        _ExtrudePoints.push(new THREE.Vector3(ExtrudePoints[i].x, ExtrudePoints[i].y, ExtrudePoints[i].z));
    }

    let shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 5);

    let _ray = new THREE.Raycaster();
    let _origin = new THREE.Vector3();
    let _direction = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0,-1, 0)];

    let extrudeSettings = {steps: 25 * ExtrudePoints.length, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(_ExtrudePoints, false)};
    let extrudeGeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);


    let mesh = new THREE.Mesh(extrudeGeometry, new THREE.MeshBasicMaterial({color: 0xff0000}));

    for (let i = 0; i < points.count; i++) {

        _origin.set(points.array[i*3], points.array[i*3+1], points.array[i*3+2]);

        for (let j = 0; j < _direction.length; j++) {

            _ray.set(_origin, _direction[j].normalize());
            let intersect = _ray.intersectObject(mesh);

            if (intersect.length > 0) {

                buff.vertex.push(intersect[0].point);
                buff.index.push(i);
                buff.color.push(0);
            }
        }
    }

    for (let i = 0; i < points.count; i++) {

        for (let j = 0; j < buff.vertex.length; j++) {

            let tmp1 = new THREE.Vector2(points.array[i*3], points.array[i*3+2]);
            let tmp2 = new THREE.Vector2(buff.vertex[j].x, buff.vertex[j].z);

            if (tmp1.distanceTo(tmp2) < 3.5) {
    
                if (RepeatIndexCheck(buff.index, i) === false) {

                        buff.index.push(i);
                        buff.vertex.push(buff.vertex[j]);
                        buff.color.push(1);
                }
            }
        }
    }

    return buff;
}

function RepeatIndexCheck(Indexes, index) {

    for (let i = 0; i < Indexes.length; i++) {

        if (Indexes[i] === index)
            return true;
    }

    return false;
}

self.onmessage = function(e) {

    let data = e.data;

    let result = null;

    switch(data.cmd) {

        case 'generate':
            result = GenerateRoad(data.points, data.ExtrudePoints);
            self.postMessage({'cmd':'generated', 'dataRoad': result});
            break;
    }
};