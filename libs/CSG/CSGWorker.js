/*
* author lovepsone
*/

import {CSG} from './CSG.js'; // Works for Google Chrome v 80.0.3987.78 (beta)
import {Vertex} from './Vertex.js'; // Works for Google Chrome v 80.0.3987.78 (beta)
import {Polygon} from './Polygon.js'; // Works for Google Chrome v 80.0.3987.78 (beta)

self.onmessage = function(e) {

    CSG.fromData = function(faces, vertices, faceVertexUvs, matrix) {

        let polys = [], fm = ['a','b','c'];
        
        for (let i = 0; i < faces.length; i++) {
            
            let f = faces[i];
            let buffVertices = [];
    
            buffVertices.push(new Vertex(vertices[faces[i][fm[0]]], faces[i].vertexNormals[0], faceVertexUvs[0][i][0]));
            buffVertices.push(new Vertex(vertices[faces[i][fm[1]]], faces[i].vertexNormals[0], faceVertexUvs[0][i][0]));
            buffVertices.push(new Vertex(vertices[faces[i][fm[2]]], faces[i].vertexNormals[0], faceVertexUvs[0][i][0]));
    
            polys.push(new Polygon(buffVertices));
        }
        
        let csg = CSG.fromPolygons(polys);
    
        CSG._tmpm3.getNormalMatrix(matrix);
    
        for (let i = 0; i < csg.polygons.length; i++) {
            
            for(let j = 0; j < csg.polygons[i].vertices.length; j++) {
    
                let v = csg.polygons[i].vertices[j];
                v.pos.applyMatrix4(matrix);
                v.normal.applyMatrix3(CSG._tmpm3);
            }
        }
        return csg;
    }

    let data = e.data;

    switch(data.cmd) {

        case 'union':
                let bspA = CSG.fromData(data.A.faces, data.A.vertices, data.A.faceVertexUvs,  data.A.matrix);
                let bspB = CSG.fromData(data.B.faces, data.B.vertices, data.B.faceVertexUvs,  data.B.matrix);
                let bspResult = bspA.subtract(bspB);
				//self.postMessage({});
            break;
    
        case 'subtract':
            let bspA = CSG.fromData(data.A.faces, data.A.vertices, data.A.faceVertexUvs,  data.A.matrix);
            let bspB = CSG.fromData(data.B.faces, data.B.vertices, data.B.faceVertexUvs,  data.B.matrix);
            let bspResult = bspA.subtract(bspB);
				//self.postMessage({});
        break;

        case 'intersect':
            let bspA = CSG.fromData(data.A.faces, data.A.vertices, data.A.faceVertexUvs,  data.A.matrix);
            let bspB = CSG.fromData(data.B.faces, data.B.vertices, data.B.faceVertexUvs,  data.B.matrix);
            let bspResult = bspA.subtract(bspB);
            //self.postMessage({});
        break;
    }
};