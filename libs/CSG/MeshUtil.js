/*
* author https://github.com/chandlerprall/ThreeCSG/
* modified code lovepsone
*/

import * as THREE from './../three/Three.js';
import {Triangle} from './Triangle.js';
import {isBufferGeometry, isConvexSet} from './Utils.js';
import {BSPNode} from './BSPNode.js';


function GeometryToTriangles(geometry) {

    const triangles = [];
    const {faces, vertices} = geometry
    
    for (let i = 0; i < faces.length; i++) {
        
        const face = faces[i];
        const a = vertices[face.a];
        const b = vertices[face.b];
        const c = vertices[face.c];
        const triangle = new Triangle(a, b, c);
        triangles.push(triangle);
    }
    
    return triangles;
}

function BufferGeometryToTriangles(geometry) {

    // working with indexed bufferGeometries
    const positions = geometry.attributes.position.array;
    const indexes = geometry.index.array;
    const triangles = [];

    for (let i = 0; i < indexes.length; i += 3) {

        const a = new THREE.Vector3().fromArray(positions, indexes[i + 0] * 3);
        const b = new THREE.Vector3().fromArray(positions, indexes[i + 1] * 3);
        const c = new THREE.Vector3().fromArray(positions, indexes[i + 2] * 3);
        const triangle = new Triangle(a, b, c);
        triangles.push(triangle);
    }

    return triangles;
}

function convertGeometryToTriangles(geometry) {
    
    if (isBufferGeometry(geometry)) {

        return BufferGeometryToTriangles(geometry);
    }
    else {

        return GeometryToTriangles(geometry);
    }
}

function transformBSP(bsp, mesh) {
    
    mesh.updateMatrixWorld(true);
    const { matrixWorld: transform} = mesh;
    return bsp.clone(transform);
}
export {convertGeometryToTriangles, transformBSP}