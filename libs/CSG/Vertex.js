/*
* author https://github.com/manthrax/THREE-CSGMesh/blob/master/CSGMesh.js
* modified code lovepsone
*/

// ## License
// 
// Copyright (c) 2011 Evan Wallace (http://madebyevan.com/), under the MIT license.
// THREE.js rework by thrax

// Represents a vertex of a polygon. Use your own vertex class instead of this
// one to provide additional features like texture coordinates and vertex
// colors. Custom vertex classes need to provide a `pos` property and `clone()`,
// `flip()`, and `interpolate()` methods that behave analogous to the ones
// defined by `CSG.Vertex`. This class provides `normal` so convenience
// functions like `CSG.sphere()` can return a smooth vertex normal, but `normal`
// is not used anywhere else.

import {Vector} from './Vector.js';

class Vertex {

    constructor(pos, normal, uv) {

        this.pos = new Vector(pos);
        this.normal = new Vector(normal);
        this.uv = new Vector(uv);
    }

    clone() {

        return new Vertex(this.pos.clone(),this.normal.clone(),this.uv.clone());
    }

    // Invert all orientation-specific data (e.g. vertex normal). Called when the
    // orientation of a polygon is flipped.
    flip() {

        this.normal = this.normal.negated();
    }

    // Create a new vertex between this vertex and `other` by linearly
    // interpolating all properties using a parameter of `t`. Subclasses should
    // override this to interpolate additional properties.
    interpolate(other, t) {

        return new Vertex(this.pos.lerp(other.pos, t),this.normal.lerp(other.normal, t),this.uv.lerp(other.uv, t))
    }
}

export {Vertex}