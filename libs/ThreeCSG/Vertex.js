/*
* author https://github.com/Wilt/ThreeCSG/blob/develop/ThreeCSG.js
* lovepsone converted ES6
*/

import * as THREE from './../three/Three.js';

const EPSILON = 1e-5,
    COPLANAR = 0,
    FRONT = 1,
    BACK = 2,
    SPANNING = 3;

class Vertex {

    constructor(x, y, z, normal, uv) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.normal = normal || new THREE.Vector3();
        this.uv = uv || new THREE.Vector2();
    }

    clone() {

        return new Vertex(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
    }

    add(vertex) {

        this.x += vertex.x;
        this.y += vertex.y;
        this.z += vertex.z;
        return this;
    }

    subtract(vertex) {
        this.x -= vertex.x;
        this.y -= vertex.y;
        this.z -= vertex.z;
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    cross(vertex) {
        
        let x = this.x, y = this.y, z = this.z;

        this.x = y * vertex.z - z * vertex.y;
        this.y = z * vertex.x - x * vertex.z;
        this.z = x * vertex.y - y * vertex.x;

        return this;
    }

    normalize() {

        let length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

        this.x /= length;
        this.y /= length;
        this.z /= length;

        return this;
    }

    dot(vertex) {

        return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;
    }

    lerp(a, t) {

        this.add(a.clone().subtract(this).multiplyScalar(t));
        this.normal.add(a.normal.clone().sub(this.normal).multiplyScalar(t));
        this.uv.add(a.uv.clone().sub(this.uv).multiplyScalar(t));

        return this;
    }

    interpolate(other, t) {

        return this.clone().lerp(other, t);
    }

    applyMatrix4(m) {

        // input: THREE.Matrix4 affine matrix

        let x = this.x, y = this.y, z = this.z;

        let e = m.elements;

        this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
        this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
        this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

        return this;

    }
}

export {Vertex};