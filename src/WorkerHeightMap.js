/*
* author lovepsone
*/

importScripts('./../libs/three.min.js');

function convertFaseToPointsAndNormals(_face, _vertices, _points, _normals, _colors) {

    _points.push(_vertices[_face.a], _vertices[_face.b], _vertices[_face.c]);
    let vertexNormals = _face.vertexNormals;

    if (vertexNormals.length === 3) {

        _normals.push(vertexNormals[0], vertexNormals[1], vertexNormals[2]);
    } else {

        let normal = _face.normal;
        _normals.push(normal, normal, normal);
    }

    _colors.push(0, 0, 1, 0, 0, 1, 0, 0, 0.5);
    _colors.push(0, 0, 1, 0, 0, 0.5, 0, 0, 1);
    _colors.push(0, 0, 0.5, 0, 0, 1, 0, 0, 1);
}

function WorkerHeightMap(pixel, size, spacing, heightOffset) {

    let vertices = [];
    let buffVertices = [], buffNormals = [], buffColors = [];
    var maxH = 0.0, minH = 0.0;

    let _width = _depth = size;
    let _spacingX = spacing[0], _spacingZ = spacing[1];

    //transform the pixels to verteces
    for (let x = 0; x < _depth; x++) {

        for (let z = 0; z < _width; z++) {

            let vertex = new THREE.Vector3(x * _spacingX, pixel.data[z * 4 + (_depth * x * 4)] / heightOffset, z * _spacingZ);
            vertices.push(vertex);

            if (maxH < vertex.y) maxH = vertex.y;
            if (minH > vertex.y) minH = vertex.y;
        }
    }

    //transform the pixels to points and normals
    for (let z = 0; z < _depth - 1; z++) {

        for (let x = 0; x < _width - 1; x++) {

           convertFaseToPointsAndNormals(
               new THREE.Face3((x + z * _width), ((x + 1) + (z * _width)), ((x + 1) + ((z + 1) * _width))),
               vertices,
               buffVertices,
               buffNormals,
               buffColors
            );

           convertFaseToPointsAndNormals(
               new THREE.Face3(((x + 1) + ((z + 1) * _width)), (x + ((z + 1) * _width)), (x + z * _width)),
               vertices,
               buffVertices,
               buffNormals,
               buffColors
               );
        }
    }

    return [buffVertices, buffNormals, buffColors, maxH, minH];
}

self.onmessage = function(e) {

    let data = e.data;

    switch(data.cmd) {

        case 'start':
            break;
        case 'stop':
            self.close()
            break;
        case 'pixels':
            let buff = WorkerHeightMap(data.data, data.size, data.spacingXZ, data.heightOffset);
            self.postMessage({'cmd': 'onLoadData', 'points': buff[0], 'normals': buff[1], 'colors': buff[2], 'max': buff[3], 'min': buff[4]});
            break;
        case 'colors':
            break;

    }

    //self.postMessage(1);
};
