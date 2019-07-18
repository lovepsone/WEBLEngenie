/*
* author lovepsone
*/

importScripts('./../libs/three.min.js');

function WorkerHeightMap(pixel, size, spacing, heightOffset) {

    let faces = [], vertices = [];
    let buffVertices = [], buffNormals = [];
    let _width = _depth = size;
    let _spacingX = spacing[0], _spacingZ = spacing[1];

    //transform the pixels to verteces
    for (let x = 0; x < _depth; x++) {

        for (let z = 0; z < _width; z++) {

            let vertex = new THREE.Vector3(x * _spacingX, pixel.data[z * 4 + (_depth * x * 4)] / heightOffset, z * _spacingZ);
            vertices.push(vertex);
        }
    }

    //transform the pixels to faces
    for (let z = 0; z < _depth - 1; z++) {

        for (let x = 0; x < _width - 1; x++) {

            faces.push(new THREE.Face3((x + z * _width), ((x + 1) + (z * _width)), ((x + 1) + ((z + 1) * _width))));
            faces.push(new THREE.Face3(((x + 1) + ((z + 1) * _width)), (x + ((z + 1) * _width)), (x + z * _width)));
        }
    }

		// преобразование в буфферную сетку 
	for(let i = 0; i < faces.length; i ++) {

		let face = faces[i];
		buffVertices.push(vertices[face.a], vertices[face.b], vertices[face.c]);
		let vertexNormals = face.vertexNormals;

		if (vertexNormals.length === 3) {

			buffNormals.push(vertexNormals[0], vertexNormals[1], vertexNormals[2]);
		} else {

			let normal = face.normal;
			buffNormals.push(normal, normal, normal);
		}
    }

    return [buffVertices, buffNormals];
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
            self.postMessage(buff);
            break;

    }

    //self.postMessage(1);
};
