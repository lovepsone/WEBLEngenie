/*
* author https://github.com/chandlerprall/ThreeCSG/
* modified code lovepsone
*/

import * as THREE from './../three/Three.js';
import {Triangle} from './Triangle.js';
import {CLASSIFY_COPLANAR, CLASSIFY_FRONT, CLASSIFY_BACK, CLASSIFY_SPANNING} from './Constants.js';

function isBufferGeometry(geometry) {
    
    return geometry instanceof (
        THREE.BufferGeometry || 
        THREE.BoxBufferGeometry || 
        THREE.PlaneBufferGeometry || 
        THREE.CircleBufferGeometry || 
        THREE.ConeBufferGeometry || 
        THREE.CylinderBufferGeometry || 
        THREE.DodecahedronBufferGeometry || 
        THREE.ExtrudeBufferGeometry || 
        THREE.IcosahedronBufferGeometry || 
        THREE.LatheBufferGeometry || 
        THREE.OctahedronBufferGeometry || 
        THREE.ParametricBufferGeometry || 
        THREE.PolyhedronBufferGeometry || 
        THREE.RingBufferGeometry || 
        THREE.ShapeBufferGeometry || 
        THREE.SphereBufferGeometry || 
        THREE.TetrahedronBufferGeometry || 
        THREE.TextBufferGeometry || 
        THREE.TorusBufferGeometry || 
        THREE.TorusKnotBufferGeometry || 
        THREE.TubeBufferGeometry
    );
}

function isConvexSet(triangles) {
    
    for (let i = 0; i < triangles.length; i++) {
        
        for (let j = i + 1; j < triangles.length; j++) {

            const side = triangles[i].classifySide(triangles[j]);
            if (side & CLASSIFY_FRONT) return false;
        }
    }
    
    return true;
}

export {isBufferGeometry, isConvexSet}