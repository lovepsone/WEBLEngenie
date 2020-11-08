/*
* author lovepsone
*/

export const STATE = {

    ACTIVE: 1,
    ISLAND_SLEEPING: 2,
    WANTS_DEACTIVATION: 3,
    DISABLE_DEACTIVATION: 4,
    DISABLE_SIMULATION: 5,
};

export const FLAG = {

    RIGIDBODY: 0,
    STATIC_OBJECT: 1,
    KINEMATIC_OBJECT: 2,
    NO_CONTACT_RESPONSE: 4,
    CUSTOM_MATERIAL_CALLBACK: 8,
    CHARACTER_OBJECT: 16,
    DISABLE_VISUALIZE_OBJECT: 32,
    DISABLE_SPU_COLLISION_PROCESSING: 64
};

export const GROUP = {

    ALL: -1,
    DEFAULT: 1,
    STATIC: 2,
    KINEMATIC: 4,
    DEBRIS: 8,
    SENSORTRIGGER: 16,
    NOCOLLISION: 32,
    GROUP0: 64,
    GROUP1: 128,
    GROUP2: 256,
    GROUP3: 512,
    GROUP4: 1024,
    GROUP5: 2048,
    GROUP6: 4096,
    GROUP7 : 8192
};

/*
* function https://github.com/lo-th/Ammo.lab/blob/gh-pages/src/shot/Geometry.js
*/

export function GeometryInfo(geometry) {

	let tmpGeometry = new THREE.Geometry().fromBufferGeometry(geometry);
    tmpGeometry.mergeVertices();

    const totalVertices = geometry.attributes.position.array.length / 3;
	const numVertices = tmpGeometry.vertices.length;
    const numFaces = tmpGeometry.faces.length;

    geometry.realVertices = new Float32Array(numVertices * 3);
    geometry.realIndices = new (numFaces * 3 > 65535 ? Uint32Array : Uint16Array)(numFaces * 3);
    
	let i = numVertices;
	while (i--) {

		geometry.realVertices[i * 3] = tmpGeometry.vertices[i].x;
		geometry.realVertices[i * 3 + 1] = tmpGeometry.vertices[i].y;
		geometry.realVertices[i * 3 + 2] = tmpGeometry.vertices[i].z;
    }

	i = numFaces;
	while (i--) {

		geometry.realIndices[i * 3] = tmpGeometry.faces[i].a;
		geometry.realIndices[i * 3 + 1] = tmpGeometry.faces[i].b;
		geometry.realIndices[i * 3 + 2] = tmpGeometry.faces[i].c;
	}

    tmpGeometry.dispose();

    let faces = [];
    i = geometry.realIndices.length;

    while (i--) {

        const p = geometry.realIndices[i] * 3;
        faces[i * 3] = geometry.realVertices[p];
        faces[i * 3 + 1] = geometry.realVertices[p + 1];
        faces[i * 3 + 2] = geometry.realVertices[p + 2];
    }

    return faces;
}