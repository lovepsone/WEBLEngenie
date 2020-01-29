/*
* author https://github.com/manthrax/THREE-CSGMesh/blob/master/CSGMesh.js
* modified code lovepsone
*/

// ## License
// 
// Copyright (c) 2011 Evan Wallace (http://madebyevan.com/), under the MIT license.
// THREE.js rework by thrax

// Represents a 3D vector.
// 
// Example usage:
// 
//     new CSG.Vector(1, 2, 3);
//     new CSG.Vector([1, 2, 3]);
//     new CSG.Vector({ x: 1, y: 2, z: 3 });

import * as THREE from './../three/Three.js';

class Vector extends THREE.Vector3 {

    constructor(x, y, z) {

        if (arguments.length == 3)
            super(x, y, z)
        else if (Array.isArray(x))
            super(x[0], x[1], x[2])
        else if (typeof x == 'object')
            super().copy(x)
        else
            throw "Invalid constructor to vector"
    }

    clone() {

        return new Vector(this)
    }

    negated() {

        return this.clone().multiplyScalar(-1)
    }

    plus(a) {
        return this.clone().add(a);
    }

    minus(a) {

        return this.clone().sub(a)
    }
    times(a) {

        return this.clone().multiplyScalar(a)
    }

    dividedBy(a) {

        return this.clone().divideScalar(a)
    }

    lerp(a, t) {

        return this.plus(a.minus(this).times(t))
    }

    unit() {
        return this.dividedBy(this.length())
    }

    cross(a) {

        return THREE.Vector3.prototype.cross.call(this.clone(), a)
    }
}

export {Vector}