/*
* author https://github.com/chandlerprall/ThreeCSG/
* modified code lovepsone
*/

import * as THREE from '../three/Three.js';
import {CLASSIFY_COPLANAR, CLASSIFY_FRONT, CLASSIFY_BACK, CLASSIFY_SPANNING} from './Constants.js';

const EPSILON = 1e-6;

class Triangle {
    
    constructor(a, b, c) {
        
        if (a === undefined || b === undefined || c === undefined) {
            
            this.a = new THREE.Vector3();
            this.b = new THREE.Vector3();
            this.c = new THREE.Vector3();
            this.normal = new THREE.Vector3();
            this.w = 0;
            return;
        }
        
        this.a = a.clone();
        this.b = b.clone();
        this.c = c.clone();
        this.normal = new THREE.Vector3();
        this.w = 0;
        this.computeNormal();
    }
    
    computeNormal() {
        
        const tempVector3 = new THREE.Vector3();
        tempVector3.copy(this.c).sub(this.a);
        this.normal.copy(this.b).sub(this.a).cross(tempVector3).normalize();
        this.w = this.normal.dot(this.a);
    }
    
    classifyPoint(point) {
        
        const side = this.normal.dot(point) - this.w;
        
        if (Math.abs(side) < EPSILON) return CLASSIFY_COPLANAR;
        if (side > 0) return CLASSIFY_FRONT;
        return CLASSIFY_BACK;
    }
    
    classifySide(triangle) {
        
        let side = CLASSIFY_COPLANAR;
        side |= this.classifyPoint(triangle.a);
        side |= this.classifyPoint(triangle.b);
        side |= this.classifyPoint(triangle.c);
        return side;
    }
    
    invert() {
        
        const { a, c } = this;
        this.a = c;
        this.c = a;
        this.normal.multiplyScalar(-1);
        this.w *= -1;
    }
    
    clone(){
        
        return new Triangle(this.a, this.b, this.c);
    }

    toNumberArray() {
      
        const arr = [
          this.a.x, this.a.y, this.a.z,
          this.b.x, this.b.y, this.b.z,
          this.c.x, this.c.y, this.c.z,
          this.normal.x, this.normal.y, this.normal.z,
          this.w,
        ];
        return arr;
    }
    
    toArrayBuffer() {
        
        const arr = this.toNumberArray();
        return Float32Array.from(arr).buffer;
    }
    
    fromNumberArray(arr) {
        
        if (arr.length !== 13) throw new Error(`Array has incorrect size. It's ${arr.length} and should be 13`);
        
        this.a.set(arr[0], arr[1], arr[2]);
        this.b.set(arr[3], arr[4], arr[5]);
        this.c.set(arr[6], arr[7], arr[8]);
        this.normal.set(arr[9], arr[10], arr[11]);
        this.w = arr[12];
    }
    
    fromArrayBuffer(buff) {
        
        const arr = new Float32Array(buff, 0, buff.byteLength / Float32Array.BYTES_PER_ELEMENT);
        this.fromNumberArray(Array.from(arr));
    }

}

export {Triangle};