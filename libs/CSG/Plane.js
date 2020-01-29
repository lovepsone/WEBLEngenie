/*
* author https://github.com/manthrax/THREE-CSGMesh/blob/master/CSGMesh.js
* modified code lovepsone
*/

// ## License
// 
// Copyright (c) 2011 Evan Wallace (http://madebyevan.com/), under the MIT license.
// THREE.js rework by thrax

// Represents a plane in 3D space.

import {Polygon} from './Polygon.js'

class Plane {

    constructor(normal, w) {

        this.normal = normal;
        this.w = w;
    }

    clone() {

        return new Plane(this.normal.clone(),this.w);
    }

    flip() {

        this.normal = this.normal.negated();
        this.w = -this.w;
    }

    // Split `polygon` by this plane if needed, then put the polygon or polygon
    // fragments in the appropriate lists. Coplanar polygons go into either
    // `coplanarFront` or `coplanarBack` depending on their orientation with
    // respect to this plane. Polygons in front or in back of this plane go into
    // either `front` or `back`.
    splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {

        const COPLANAR = 0, FRONT = 1, BACK = 2, SPANNING = 3;

        // Classify each point as well as the entire polygon into one of the above
        // four classes.
        let polygonType = 0, types = [];

        for (let i = 0; i < polygon.vertices.length; i++) {

            let t = this.normal.dot(polygon.vertices[i].pos) - this.w;
            let type = (t < -Plane.EPSILON) ? BACK : (t > Plane.EPSILON) ? FRONT : COPLANAR;
            polygonType |= type;
            types.push(type);
        }

        // Put the polygon in the correct list, splitting it when necessary.
        switch (polygonType) {
            
            case COPLANAR:
                (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
            break;
            
            case FRONT:
                front.push(polygon);
            break;
            
            case BACK:
                back.push(polygon);
            break;
            
            case SPANNING:
                let f = [], b = [];

                for (let i = 0; i < polygon.vertices.length; i++) {
                    
                    let j = (i + 1) % polygon.vertices.length;
                    let ti = types[i], tj = types[j];
                    let vi = polygon.vertices[i], vj = polygon.vertices[j];
    
                    if (ti != BACK) f.push(vi);
                    if (ti != FRONT)b.push(ti != BACK ? vi.clone() : vi);
                    if ((ti | tj) == SPANNING) {

                        let t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.minus(vi.pos));
                        let v = vi.interpolate(vj, t);
                        f.push(v);
                        b.push(v.clone());
                    }
                }

                if (f.length >= 3) front.push(new Polygon(f, polygon.shared));
                if (b.length >= 3) back.push(new Polygon(b, polygon.shared));
            break;
        }
    }

}

// `Plane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a
// point is on the plane.
Plane.EPSILON = 1e-5;

Plane.fromPoints = function(a, b, c) {

    let n = b.minus(a).cross(c.minus(a)).unit();
    return new Plane(n,n.dot(a));
}

export {Plane}