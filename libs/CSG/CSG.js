/*
* author https://github.com/manthrax/THREE-CSGMesh/blob/master/CSGMesh.js
* modified code lovepsone
*/

// ## License
// 
// Copyright (c) 2011 Evan Wallace (http://madebyevan.com/), under the MIT license.
// THREE.js rework by thrax

// Holds a binary space partition tree representing a 3D solid. Two solids can
// be combined using the `union()`, `subtract()`, and `intersect()` methods.

import * as THREE from './../three/Three.js';
import {Node} from './Node.js';
import {Vertex} from './Vertex.js';
import {Polygon} from './Polygon.js';

class CSG {

    constructor() {

        this.polygons = [];
    }

    clone() {
    
        let csg = new CSG();
        csg.polygons = this.polygons.map(function(p) {
            return p.clone();
        });
        return csg;
    }

    toPolygons() {

        return this.polygons;
    }

    union(csg) {

        let a = new Node(this.clone().polygons);
        let b = new Node(csg.clone().polygons);
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        return CSG.fromPolygons(a.allPolygons());
    }

    subtract(csg) {
        let a = new Node(this.clone().polygons);
        let b = new Node(csg.clone().polygons);
        a.invert();
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a.invert();
        return CSG.fromPolygons(a.allPolygons());
    }

    intersect(csg) {
    
        let a = new Node(this.clone().polygons);
        let b = new Node(csg.clone().polygons);
        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.build(b.allPolygons());
        a.invert();
        return CSG.fromPolygons(a.allPolygons());
    }

    // Return a new CSG solid with solid and empty space switched. This solid is
    // not modified.
    inverse() {
    
        let csg = this.clone();
        csg.polygons.map(function(p) {
            p.flip();
        });
        return csg;
    }
}

// Construct a CSG solid from a list of `Polygon` instances.
CSG.fromPolygons = function(polygons) {
    let csg = new CSG();
    csg.polygons = polygons;
    return csg;
}

CSG.fromGeometry=function(geom){
    if(geom.isBufferGeometry)
        geom = new THREE.Geometry().fromBufferGeometry(geom)
    var fs = geom.faces;
    var vs = geom.vertices;
    var polys=[]
    var fm=['a','b','c']
    for(var i=0;i<fs.length;i++){
        var f = fs[i];
        var vertices=[]
        for(var j=0;j<3;j++) vertices.push(new Vertex(vs[f[fm[j]]],f.vertexNormals[j],geom.faceVertexUvs[0][i][j]))
        polys.push(new Polygon(vertices))
    }
    return CSG.fromPolygons(polys);
}
CSG._tmpm3 = new THREE.Matrix3();
CSG.fromMesh=function(mesh){

    var csg = CSG.fromGeometry(mesh.geometry)
    CSG._tmpm3.getNormalMatrix(mesh.matrix);
    for(var i=0;i<csg.polygons.length;i++){
        var p = csg.polygons[i]
        for(var j=0;j<p.vertices.length;j++){
            var v=p.vertices[j]
            v.pos.applyMatrix4(mesh.matrix);
            v.normal.applyMatrix3(CSG._tmpm3);
        }
    }
    return csg;
}

CSG.toMesh=function(csg,toMatrix){
    var geom = new THREE.Geometry();
    var ps = csg.polygons;
    var vs = geom.vertices;
    var fvuv = geom.faceVertexUvs[0]
    for(var i=0;i<ps.length;i++){
        var p = ps[i]
        var pvs=p.vertices;
        var v0=vs.length;
        var pvlen=pvs.length
        
        for(var j=0;j<pvlen;j++)
            vs.push(new THREE.Vector3().copy(pvs[j].pos))


        for(var j=3;j<=pvlen;j++){
            var fc = new THREE.Face3();
            var fuv = []
            fvuv.push(fuv)
            var fnml = fc.vertexNormals;
            fc.a=v0;
            fc.b=v0+j-2;
            fc.c=v0+j-1;

            fnml.push(new THREE.Vector3().copy(pvs[0].normal))
            fnml.push(new THREE.Vector3().copy(pvs[j-2].normal))
            fnml.push(new THREE.Vector3().copy(pvs[j-1].normal))
            fuv.push(new THREE.Vector3().copy(pvs[0].uv))
            fuv.push(new THREE.Vector3().copy(pvs[j-2].uv))
            fuv.push(new THREE.Vector3().copy(pvs[j-1].uv))

            fc.normal = new THREE.Vector3().copy(p.plane.normal)
            geom.faces.push(fc)
        }
    }
    var inv = new THREE.Matrix4().getInverse(toMatrix);
    geom.applyMatrix(inv);
    geom.verticesNeedUpdate = geom.elementsNeedUpdate = geom.normalsNeedUpdate = true;
    geom.computeBoundingSphere();
    geom.computeBoundingBox();
    var m = new THREE.Mesh(geom);
    m.matrix.copy(toMatrix);
    m.matrix.decompose(m.position,m.rotation,m.scale)
    m.updateMatrixWorld();
    return m
}


CSG.ieval=function(tokens,index=0){
    if(typeof tokens === 'string')
        CSG.currentOp=tokens;
    else if(tokens instanceof Array){
        for(let i=0;i<tokens.length;i++)CSG.ieval(tokens[i],0);
    }else if(typeof tokens==='object'){
        var op=CSG.currentOp;
        tokens.updateMatrix();
        tokens.updateMatrixWorld();
        if(!CSG.sourceMesh)
            CSG.currentPrim =  CSG.fromMesh(CSG.sourceMesh = tokens);
        else{
            CSG.nextPrim = CSG.fromMesh(tokens);
            CSG.currentPrim = CSG.currentPrim[op](CSG.nextPrim);
        }
        if(CSG.doRemove)tokens.parent.remove(tokens);
    }//union,subtract,intersect,inverse
}

CSG.eval=function(tokens,doRemove){//[['add',mesh,mesh,mesh,mesh],['sub',mesh,mesh,mesh,mesh]]
    CSG.currentOp=null;
    CSG.sourceMesh=null;
    CSG.doRemove=doRemove;
    CSG.ieval(tokens)
    var result = CSG.toMesh( CSG.currentPrim, CSG.sourceMesh.matrix );
    result.material = CSG.sourceMesh.material;
    result.castShadow  = result.receiveShadow = true;
    return result;
}

export {CSG}
