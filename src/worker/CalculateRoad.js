/*
* @author lovepsone 2019 - 2021
*/

import * as THREE from './../../libs/three.module.js';

let _PostData = {vertex: [], index: []};

class CalculateRoad {

    constructor(size = 5) {

        this.ShapeTop = new THREE.Shape();
        this.ShapeTop.moveTo(0, 0);
        this.ShapeTop.lineTo(0, size);

        this.ShapeLeft = new THREE.Shape();
		this.ShapeLeft.moveTo(0, 0);
        this.ShapeLeft.lineTo(20, 0);

        this.ShapeRight = new THREE.Shape();
        this.ShapeRight.moveTo(0, size);
		this.ShapeRight.lineTo(20, size);

        this.ExtrudePoints = [];
    }

    BuildTop(points, positions) {

        for (let i = 0; i < positions.length; i++) {

            this.ExtrudePoints.push(new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z));
        }

        const ray = new THREE.Raycaster();
        const origin = new THREE.Vector3();
        const direction = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0,-1, 0)];
        const size = Math.sqrt(points.count);

        const mesh = new THREE.Mesh(
            new THREE.ExtrudeBufferGeometry(
                this.ShapeTop,
                {steps: 25 * this.ExtrudePoints.length, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(this.ExtrudePoints, false)}
            ),
            new THREE.MeshBasicMaterial({color: 0xff0000})
        );

        for (let i = 0; i < points.count; i++) {

            origin.set(points.array[i * 3], points.array[i * 3 + 1], points.array[i * 3 + 2]);
    
            for (let j = 0; j < direction.length; j++) {
    
                ray.set(origin, direction[j].normalize());
                const intersect = ray.intersectObject(mesh);
    
                if (intersect.length > 0) {
    
                    _PostData.vertex.push(intersect[0].point);
                    _PostData.index.push(i);
                }
            }
        }

        for (let i = 0; i < 3; i++) this.addBoard(_PostData, size);

        return _PostData;
    }
    
    RepeatIndexCheck(Indexes, index) {

        for (let i = 0; i < Indexes.length; i++) {
    
            if (Indexes[i] === index) return true;
        }
        return false;
    }

    NeighborSearch(index, size, Indexes) {

        let a, b, c, d, result = [];

        //    b
        // a --- c
        //    d
        if (index > 0) {

            a = index - 1;
            b = index - size;
            c = index + 1;
            d = index + size;
        }

        if (a < 0 || this.RepeatIndexCheck(Indexes, a) === true) a = null;
        if (b < 0 || this.RepeatIndexCheck(Indexes, b) === true) b = null;
        if (c > (size * size) || this.RepeatIndexCheck(Indexes, c) === true) c = null;
        if (d > (size * size) || this.RepeatIndexCheck(Indexes, d) === true) d = null;

        if (a != null) result.push(a);
        if (b != null) result.push(b);
        if (c != null) result.push(c);
        if (d != null) result.push(d);

        return result;
    }

    addBoard(data, size) {

        let bufIndex = [], bufVertex = [];

        for (let i = 0; i < data.index.length; i++) {

            const neighbor = this.NeighborSearch(data.index[i], size, data.index)

            for (let j = 0; j < neighbor.length; j++) {

                bufIndex.push(neighbor[j]);
                bufVertex.push(data.vertex[i]);
            }
        }
        data.index.push(...bufIndex);
        data.vertex.push(...bufVertex);
    }

    clearData() {

        _PostData = {vertex: [], index: []};
    }
}

export {CalculateRoad};