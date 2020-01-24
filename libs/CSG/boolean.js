/*
* author https://github.com/chandlerprall/ThreeCSG/
* modified code lovepsone
*/

import {BSPNode} from './BSPNode.js';
import {convertGeometryToTriangles, transformBSP} from  './MeshUtil.js';
import * as THREE from './../three/Three.js';

function _intersect(a, b) {
    
    const a2 = a.clone();
    const b2 = b.clone();
    a2.invert();
    b2.clipTo(a2);
    b2.invert();
    a2.clipTo(b2);
    b2.clipTo(a2);
    a2.invert();
    b2.invert();
    a2.buildFrom(b2.getTriangles());
    return a2;
}

function _union(a, b) {

    const a2 = a.clone();
    const b2 = b.clone();
    a2.clipTo(b2);
    b2.clipTo(a2);
    b2.invert();
    b2.clipTo(a2);
    b2.invert();
    a2.buildFrom(b2.getTriangles());
    return a2;
}

function _subtract(a, b) {

    const a2 = a.clone();
    const b2 = b.clone();
    a2.invert();
    a2.clipTo(b2);
    b2.clipTo(a2);
    b2.invert();
    b2.clipTo(a2);
    a2.invert();
    a2.buildFrom(b2.getTriangles());
    return a2;
}

function intersect(mesh1, mesh2, material, typeGeometry = 'Geometry') {

    let bsp1 = new BSPNode(convertGeometryToTriangles(mesh1.geometry));
    let bsp2 = new BSPNode(convertGeometryToTriangles(mesh2.geometry));

    const bsp1Transformed = transformBSP(bsp1, mesh1);
    const bsp2Transformed = transformBSP(bsp2, mesh2);

    const result = _intersect(bsp1Transformed, bsp2Transformed);
    const geometry = result.toGeometry(typeGeometry);

    geometry.computeBoundingBox();
    const offset = new THREE.Vector3();
    geometry.boundingBox.getCenter(offset);
    geometry.translate(-offset.x, -offset.y, -offset.z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(offset);
    return mesh;
}

function union(mesh1, mesh2, material, typeGeometry = 'Geometry') {

    let bsp1 = new BSPNode(convertGeometryToTriangles(mesh1.geometry));
    let bsp2 = new BSPNode(convertGeometryToTriangles(mesh2.geometry));

    const bsp1Transformed = transformBSP(bsp1, mesh1);
    const bsp2Transformed = transformBSP(bsp2, mesh2);

    const result = _union(bsp1Transformed, bsp2Transformed);
    const geometry = result.toGeometry(typeGeometry);

    geometry.computeBoundingBox();
    const offset = new THREE.Vector3();
    geometry.boundingBox.getCenter(offset);
    geometry.translate(-offset.x, -offset.y, -offset.z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(offset);
    return mesh;
}

function subtract(mesh1, mesh2, material, typeGeometry = 'Geometry') {

    let bsp1 = new BSPNode(convertGeometryToTriangles(mesh1.geometry));
    let bsp2 = new BSPNode(convertGeometryToTriangles(mesh2.geometry));

    const bsp1Transformed = transformBSP(bsp1, mesh1);
    const bsp2Transformed = transformBSP(bsp2, mesh2);

    const result = _subtract(bsp1Transformed, bsp2Transformed);
    const geometry = result.toGeometry(typeGeometry);

    geometry.computeBoundingBox();
    const offset = new THREE.Vector3();
    geometry.boundingBox.getCenter(offset);
    geometry.translate(-offset.x, -offset.y, -offset.z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(offset);
    return mesh;
}

export {intersect, union, subtract}