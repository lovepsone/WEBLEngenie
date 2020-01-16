/*
* author https://github.com/Wilt/ThreeCSG/blob/develop/ThreeCSG.js
* lovepsone converted ES6
*/

const EPSILON = 1e-5,
    COPLANAR = 0,
    FRONT = 1,
    BACK = 2,
    SPANNING = 3;

class Polygon {

    constructor(vertices, normal, w) {

        if (!(vertices instanceof Array)) {

            vertices = [];
        }

        this.vertices = vertices;

        if (vertices.length > 0) {

            this.calculateProperties();
        } else {

            this.normal = this.w = undefined;
        }
    }

    calculateProperties() {

        let a = this.vertices[0], b = this.vertices[1], c = this.vertices[2];

        this.normal = b.clone().subtract(a).cross(c.clone().subtract(a)).normalize();
        this.w = this.normal.clone().dot(a);

        return this;
    }

    clone() {

        let i, vertices_count, polygon = new Polygon();

        for (i = 0, vertices_count = this.vertices.length; i < vertices_count; i++) {

            polygon.vertices.push(this.vertices[i].clone());
        }

        polygon.calculateProperties();

        return polygon;
    }

    flip() {

        let i, vertices = [];

        this.normal.multiplyScalar(-1);
        this.w *= -1;

        for (i = this.vertices.length - 1; i >= 0; i--) {

            vertices.push(this.vertices[i]);
        }
        this.vertices = vertices;

        return this;
    }

    classifyVertex(vertex) {

        let side_value = this.normal.dot(vertex) - this.w;

        if (side_value < -EPSILON) {

            return BACK;
        } else if (side_value > EPSILON) {

            return FRONT;
        } else {

            return COPLANAR;
        }
    }

    classifySide(polygon) {

        let i, vertex, classification, num_positive = 0, num_negative = 0, vertice_count = polygon.vertices.length;

        for (i = 0; i < vertice_count; i++) {

            vertex = polygon.vertices[i];
            classification = this.classifyVertex(vertex);

            if (classification === FRONT) {

                num_positive++;
            } else if (classification === BACK) {

                num_negative++;
            }
        }

        if (num_positive > 0 && num_negative === 0) {
    
            return FRONT;
        } else if (num_positive === 0 && num_negative > 0) {

            return BACK;
        } else if ( num_positive === 0 && num_negative === 0 ) {

            return COPLANAR;
        } else {

            return SPANNING;
        }
    }

    splitPolygon(polygon, coplanar_front, coplanar_back, front, back) {

        let classification = this.classifySide(polygon);

        if (classification === COPLANAR) {

            ( this.normal.dot(polygon.normal) > 0 ? coplanar_front : coplanar_back ).push(polygon);
        } else if (classification === FRONT) {

            front.push(polygon);
        } else if (classification === BACK) {

            back.push(polygon);
        } else {

            let vertice_count, j, ti, tj, vi, vj, t, v, f = [], b = [];

            for (let i = 0, vertice_count = polygon.vertices.length; i < vertice_count; i++) {

                j = (i + 1) % vertice_count;
                vi = polygon.vertices[i];
                vj = polygon.vertices[j];
                ti = this.classifyVertex(vi);
                tj = this.classifyVertex(vj);

                if (ti != BACK) f.push(vi);
                if (ti != FRONT) b.push(vi);
                if ((ti | tj) === SPANNING) {
                    t = ( this.w - this.normal.dot(vi) ) / this.normal.dot(vj.clone().subtract(vi));
                    v = vi.interpolate(vj, t);
                    f.push(v);
                    b.push(v);
                }
            }


            if (f.length >= 3) front.push(new Polygon(f).calculateProperties());
            if (b.length >= 3) back.push(new Polygon(b).calculateProperties());
        }
    }
}

export {Polygon};
