/*
* author https://github.com/Wilt/ThreeCSG/blob/develop/ThreeCSG.js
* lovepsone converted ES6
*/

import * as THREE from './../three/Three.js';
import {Node} from './Node.js';
import {Polygon} from './Polygon.js';
import {Vertex} from './Vertex.js';

const EPSILON = 1e-5,
    COPLANAR = 0,
    FRONT = 1,
    BACK = 2,
    SPANNING = 3;

class ThreeBSP {

    constructor(object) {

        this.matrix = new THREE.Matrix4();
        this.create(object);
    }

    subtract(other_tree) {

        let a = this.tree.clone(), b = other_tree.tree.clone();

        a.invert();
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a.invert();
        a = new ThreeBSP(a);
        a.matrix = this.matrix;
        return a;
    }

    union(other_tree) {

        let a = this.tree.clone(), b = other_tree.tree.clone();

        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a = new ThreeBSP(a);
        a.matrix = this.matrix;
        return a;
    }

    intersect(other_tree) {

        let a = this.tree.clone(), b = other_tree.tree.clone();

        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.build(b.allPolygons());
        a.invert();
        a = new ThreeBSP(a);
        a.matrix = this.matrix;
        return a;
    }

    create(object) {

        if (object instanceof THREE.Geometry) {

            this.fromGeometry(object);
        } else if (object instanceof THREE.BufferGeometry) {

            this.fromBufferGeometry(object);
        } else if (object instanceof THREE.Mesh) {

            // #todo: add hierarchy support
            this.fromMesh(object);
        } else if (object instanceof ThreeBSP.Node) {

            this.tree = object;
            return this;
        } else {

            throw new Error('ThreeBSP: is unable to create a BSP for the given input');
        }
    }

    fromMesh(mesh) {

        let geometry = mesh.geometry;
        mesh.updateMatrix();
        this.matrix = mesh.matrix.clone();
        this.create(geometry);
    }

    toGeometry() {
        
        let i, j,
        matrix = new THREE.Matrix4().getInverse(this.matrix),
        geometry = new THREE.Geometry(),
        polygons = this.tree.allPolygons(),
        polygon_count = polygons.length,
        polygon, polygon_vertice_count,
        vertice_dict = {},
        vertex_idx_a, vertex_idx_b, vertex_idx_c,
        vertex, face,
        verticeUvs;

        for (i = 0; i < polygon_count; i++) {

            polygon = polygons[i];
            polygon_vertice_count = polygon.vertices.length;

            for (j = 2; j < polygon_vertice_count; j++) {

                verticeUvs = [];
                vertex = polygon.vertices[0];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);

                if (typeof vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined') {

                    vertex_idx_a = vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {

                    geometry.vertices.push(vertex);
                    vertex_idx_a = vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] = geometry.vertices.length - 1;
                }

                vertex = polygon.vertices[j - 1];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);
    
                if (typeof vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined') {

                    vertex_idx_b = vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {

                    geometry.vertices.push(vertex);
                    vertex_idx_b = vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] = geometry.vertices.length - 1;
                }

                vertex = polygon.vertices[j];
                verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
                vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
                vertex.applyMatrix4(matrix);
                if (typeof vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined') {
                    vertex_idx_c = vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {
                    geometry.vertices.push(vertex);
                    vertex_idx_c = vertice_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] = geometry.vertices.length - 1;
                }

                face = new THREE.Face3(
                    vertex_idx_a,
                    vertex_idx_b,
                    vertex_idx_c,
                    new THREE.Vector3(polygon.normal.x, polygon.normal.y, polygon.normal.z)
                );

                geometry.faces.push(face);
                geometry.faceVertexUvs[0].push(verticeUvs);
            }

        }
        return geometry;
    }

    toBufferGeometry() {
        
        let i, j,
        matrix = new THREE.Matrix4().getInverse(this.matrix),
        geometry = new THREE.BufferGeometry(),
        indices = [], positions = [], colors = [], normals = [], uvs = [],
        polygons = this.tree.allPolygons(),
        polygon_count = polygons.length,
        polygon, polygon_vertex_count,
        vertex_dict = {},
        vertex_idx_a, vertex_idx_b, vertex_idx_c,
        vertex,
        vertex_count = 0,
        vertexUvs;

        for(i = 0; i < polygon_count; i++ ) {

            polygon = polygons[i];
            polygon_vertex_count = polygon.vertices.length;

            for( j = 2; j < polygon_vertex_count; j++ ) {

                vertexUvs = [];

                vertex = polygon.vertices[0];
                vertex.clone().applyMatrix4(matrix); // TODO: check if clone is needed here
                uvs.push(vertex.uv.x, vertex.uv.y);

                if ( typeof vertex_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined' ) {

                    vertex_idx_a = vertex_dict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {

                    positions.push(vertex.x, vertex.y, vertex.z);
                    vertex_idx_a = vertex_count;
                    normals.push(polygon.normal.x, polygon.normal.y, polygon.normal.z);
                    vertex_count ++;
                }

                vertex = polygon.vertices[j-1];
                vertex.clone().applyMatrix4(matrix); // TODO: check if clone is needed here
                uvs.push(vertex.uv.x, vertex.uv.y);

                if (typeof vertex_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined') {

                    vertex_idx_b = vertex_dict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {

                    positions.push(vertex.x, vertex.y, vertex.z);
                    vertex_idx_b = vertex_count;
                    normals.push(polygon.normal.x, polygon.normal.y, polygon.normal.z);
                    vertex_count ++;
                }

                vertex = polygon.vertices[j];
                vertex.clone().applyMatrix4(matrix); // TODO: check if clone is needed here
                uvs.push(vertex.uv.x, vertex.uv.y);

                if (typeof vertex_dict[vertex.x + ',' + vertex.y + ',' + vertex.z] !== 'undefined') {

                    vertex_idx_c = vertex_dict[vertex.x + ',' + vertex.y + ',' + vertex.z];
                } else {
    
                    positions.push(vertex.x, vertex.y, vertex.z);
                    vertex_idx_c = vertex_count;
                    normals.push(polygon.normal.x, polygon.normal.y, polygon.normal.z);
                    vertex_count ++;
                }

                indices.push(vertex_idx_a, vertex_idx_b, vertex_idx_c);
            }
        }

        geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
        //geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.setIndex( new THREE.BufferAttribute(new Uint32Array(indices), 1));

        return geometry;
    }

    toMesh (material) {

        var geometry = this.toGeometry(), mesh = new THREE.Mesh(geometry, material);

        mesh.position.setFromMatrixPosition(this.matrix);
        mesh.rotation.setFromRotationMatrix(this.matrix);

        return mesh;
    }
    
    fromGeometry(geometry) {

        // Convert THREE.Geometry to ThreeBSP
        let i, _length_i,
        face, vertex, faceVertexUvs, uvs,
        polygon, polygons = [];

        for (i = 0, _length_i = geometry.faces.length; i < _length_i; i++) {
    
            face = geometry.faces[i];
            faceVertexUvs = geometry.faceVertexUvs[0][i];
            polygon = new Polygon();

            vertex = geometry.vertices[face.a];
            uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
            vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex);

            vertex = geometry.vertices[face.b];
            uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
            vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex);

            vertex = geometry.vertices[face.c];
            uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
            vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex);

            polygon.calculateProperties();
            polygons.push(polygon);
        }

        this.tree = new Node( polygons );
    }

    fromIndexedBufferGeometry(geometry) {

        let i, il, index, vertex, polygon,
        indices = geometry.index.array,
        positions = geometry.attributes.position.array, polygons = [];

        for(i = 0, il = indices.length; i < il; i+=3) {

            polygon = new Polygon();

            index = indices[i];
            vertex = new Vertex(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex);

            index = indices[i+1];
            vertex = new Vertex(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex);

            index = indices[i+2];
            vertex = new Vertex(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex);

            polygon.calculateProperties();
            polygons.push(polygon);
        }
        this.tree = new Node(polygons);
    }

    fromNonIndexedBufferGeometry(geometry) {

        let i, il, index, vertex, polygon,
            positions = geometry.attributes.position.array, polygons = [];

        for(i = 0, il = positions.length; i < il; i+=9 ) {

            polygon = new Polygon();

            vertex = new Vertex(positions[i], positions[i + 1], positions[i + 2]);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex );

            vertex = new Vertex(positions[i + 3], positions[i + 4], positions[i + 5]);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex );

            vertex = new Vertex(positions[i + 6], positions[i + 7], positions[i + 8]);
            vertex.applyMatrix4(this.matrix);
            polygon.vertices.push(vertex);

            polygon.calculateProperties();
            polygons.push(polygon);
        }
        this.tree = new Node( polygons );
    }

    fromBufferGeometry(geometry) {

        if(geometry.index === null) {

            this.fromNonIndexedBufferGeometry(geometry);

        } else {

            this.fromIndexedBufferGeometry(geometry);

        }
    }
}


/*
class ThreeBSP {

    constructor(geometry) {
        // Convert THREE.Geometry to ThreeBSP
        let i, _length_i,
            face, vertex, faceVertexUvs, uvs,
            polygon,
            polygons = [],
            tree;

        this.Polygon = Polygon;
        this.Vertex = Vertex;
        this.Node = Node;

        if (geometry instanceof THREE.Geometry) {

            this.matrix = new THREE.Matrix4();
        } else if (geometry instanceof THREE.Mesh) {
    
            // #todo: add hierarchy support
            geometry.updateMatrix();
            this.matrix = geometry.matrix.clone();
            geometry = geometry.geometry;
        } else if (geometry instanceof Node) {
    
            this.tree = geometry;
            this.matrix = new THREE.Matrix4();
            return this;
        } else {

            throw 'ThreeBSP: Given geometry is unsupported';
        }

        for (i = 0, _length_i = geometry.faces.length; i < _length_i; i++) {
            face = geometry.faces[i];
            faceVertexUvs = geometry.faceVertexUvs[0][i];
            polygon = new Polygon();

            if (face instanceof THREE.Face3) {
                vertex = geometry.vertices[face.a];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
                vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.b];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
                vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.c];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
                vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);
            } else if (typeof THREE.Face4) {
                vertex = geometry.vertices[face.a];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
                vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.b];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
                vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.c];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
                vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);

                vertex = geometry.vertices[face.d];
                uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[3].x, faceVertexUvs[3].y) : null;
                vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[3], uvs);
                vertex.applyMatrix4(this.matrix);
                polygon.vertices.push(vertex);
            } else {
                throw 'Invalid face type at index ' + i;
            }

            polygon.calculateProperties();
            polygons.push(polygon);
        }

        this.tree = new Node(polygons);
    }

    toMesh (material) {
        var geometry = this.toGeometry(),
            mesh = new THREE.Mesh(geometry, material);

        mesh.position.setFromMatrixPosition(this.matrix);
        mesh.rotation.setFromRotationMatrix(this.matrix);

        return mesh;
    }
}*/
export {ThreeBSP};
