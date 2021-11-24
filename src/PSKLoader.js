/*
* @author lovepsone 2019 - 2021
*/

import * as THREE from './../libs/three.module.js';

/*
    Chunks Headers :
     - ACTRHEAD: Does not contain a data pair.
     - PNTS0000: Vertices.
     - VTXW0000: Weighted edges (wedges).
     - FACE0000: Triangle faces.
     - MATT0000: Materials.
     - REFSKELT: Bone structure.
     - RAWWEIGHTS: Bone raw weights.
     - EXTRAUV#: Extra UV maps.
*/

const HeaderBytes  = {
    ChunkID: 20, // bytes String
    TypeFlag: 4, // bytes UInt32
    DataSize: 4, // bytes Int32
    DataCount: 4 // bytes Int32
}; // tottal 32 bytes

const PointBytes = {
    x: 4, // bytes float32
    y: 4, // bytes float32
    z: 4  // bytes float32
}; // total 12 bytes

const Wedges16Bytes = {
    Pointindex: 2, // bytes Int16
    Padding: 2, // bytes Int16
    U: 4, // bytes float32
    V: 4, // bytes float32
    MaterialIndex: 1, // bytes Int8
    Reserved: 1, // bytes Int8
    Padding: 2 // bytes Int16
}; // total 16 bytes

const Wedges16Bytes = { // Count lower/equal than 65536d
    Pointindex: 2, // bytes Int16
    Padding: 2, // bytes Int16
    U: 4, // bytes float32
    V: 4, // bytes float32
    MaterialIndex: 1, // bytes Int8
    Reserved: 1, // bytes Int8
    Padding: 2 // bytes Int16
}; //total 16 bytes

const Wedges32Bytes = { // Count greater than 65536d
    Pointindex: 4, // bytes Int32
    U: 4, // bytes float32
    V: 4, // bytes float32
    MaterialIndex: 4, // bytes Int32

}; //total 16 bytes

class PSKLoader extends THREE.Loader {

    constructor(manager) {

        super(manager);

        this.LastByte = 0;
    }

    load(url, onLoad, onProgress, onError) {

        const scope = this, loader = new THREE.FileLoader(this.manager);
        let resourcePath;

        if (this.resourcePath !== '') {

			resourcePath = this.resourcePath;
		} else if (this.path !== '') {

			resourcePath = this.path;
		} else {

			resourcePath = THREE.LoaderUtils.extractUrlBase(url);
		}

        loader.setPath(this.path);
		loader.setResponseType('arraybuffer');
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(this.withCredentials);

        loader.load(url, function (data) {

            try {

                scope.DataView = new DataView(data);

                const ACTRHEAD = scope.HeaderChunk(data);
                console.log(ACTRHEAD);

                const PNTS0000 = scope.HeaderChunk(data);
                console.log(PNTS0000);

                //console.log(scope.ReadPoints(PNTS0000.DataCount));
                const PointArray = scope.ReadPoints(PNTS0000.DataCount);

                const VTXW0000 = scope.HeaderChunk(data);
                console.log(VTXW0000);

            } catch (e) {

                console.error(e);
            }
        }, onProgress, onError);
    }

    HeaderChunk(data) {

        const id = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, HeaderBytes.ChunkID));
        this.LastByte += HeaderBytes.ChunkID;

        const flag = this.DataView.getUint32(this.LastByteб, false);
        this.LastByte += HeaderBytes.TypeFlag;

        const size = this.DataView.getInt32(this.LastByte, true);
        this.LastByte += HeaderBytes.DataSize;

        const count = this.DataView.getInt32(this.LastByte, true);
        this.LastByte += HeaderBytes.DataCount;

        return {ChunkID: id.split('\x00')[0], TypeFlag: flag, DataSize: size, DataCount: count};
    }

    parse(header) {

        switch(header) {

            case 'ACTRHEAD':
                break;
        }
    }

    ReadPoints(size) {

        let tmp = [];

        for (let i = 0; i < size; i++) {

            const point1 = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            tmp.push(point1);

            const point2 = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            tmp.push(point2);

            const point3 = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            tmp.push(point3);
        }

        return tmp;
    }

    ReadWedges(size) {

        if (size < 65536) {

        } else {

        }
    }
};

export {PSKLoader}