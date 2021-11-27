/*
* @author lovepsone 2019 - 2021
*/

// https://me3explorer.fandom.com/wiki/PSK_File_Format

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

const WedgesBytes = { // Count lower/equal than 65536d
    Pointindex: 2, // bytes Int16
    Padding: 2, // bytes Int16
    U: 4, // bytes float32
    V: 4, // bytes float32
    MaterialIndex: 1, // bytes Int8
    Reserved: 1, // bytes Int8
    Padding2: 2 // bytes Int16
}; //total 16 bytes

const Wedges32Bytes = { // Count greater than 65536d
    Pointindex: 4, // bytes Int32
    U: 4, // bytes float32
    V: 4, // bytes float32
    MaterialIndex: 4, // bytes Int32

}; //total 16 bytes

const FaceBytes = {

    Wedge/*[3]*/: 2, // bytes Int16 * 3 -- or int32 ?
    Materialindex: 1, // bytes Int8
    AuxMatIndex: 1, // bytes Int8
    SmoothingGroups: 4// bytes Int32
}

const MattBytes = {
    Name: 64, // bytes String
    TextureIndex: 4, // bytes int32
    PolyFlags: 4, // bytes uint32
    AuxMaterial: 4, // bytes int32
    AuxFlags: 4, // bytes uint32
    LodBias: 4, // bytes int32
    LodStyle: 4 // bytes int32
};

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

        loader.load(url, function(data) {

            try {

                scope.DataView = new DataView(data);

                const ACTRHEAD = scope.HeaderChunk(data);

                const PNTS0000 = scope.HeaderChunk(data);
                console.log(PNTS0000);
                const Points = scope.ReadPoints(PNTS0000.DataCount);

                const VTXW0000 = scope.HeaderChunk(data);
                const Wedges = scope.ReadWedges(VTXW0000.DataCount);

                const FACE0000 = scope.HeaderChunk(data);
                console.log(FACE0000);
                const Faces = scope.ReadFace(FACE0000.DataCount);

                const MATT0000 = scope.HeaderChunk(data);
                const Material = scope.ReadMaterial(MATT0000.DataCount, data);

                const REFSKELT = scope.HeaderChunk(data);

                const RAWWEIGHTS = scope.HeaderChunk(data);

                console.log(Faces);
                console.log(Wedges);

                let posAttr = [], indices = [], uv = [];

                for (let i = 0; i < Faces.length; i++) {

                    posAttr.push(Points[Wedges[Faces[i].Wedge[0]].Pointindex].x);
                    posAttr.push(Points[Wedges[Faces[i].Wedge[0]].Pointindex].y);
                    posAttr.push(Points[Wedges[Faces[i].Wedge[0]].Pointindex].z);

                    posAttr.push(Points[Wedges[Faces[i].Wedge[1]].Pointindex].x);
                    posAttr.push(Points[Wedges[Faces[i].Wedge[1]].Pointindex].y);
                    posAttr.push(Points[Wedges[Faces[i].Wedge[1]].Pointindex].z);

                    posAttr.push(Points[Wedges[Faces[i].Wedge[2]].Pointindex].x);
                    posAttr.push(Points[Wedges[Faces[i].Wedge[2]].Pointindex].y);
                    posAttr.push(Points[Wedges[Faces[i].Wedge[2]].Pointindex].z);

                    uv.push(Wedges[Faces[i].Wedge[0]].U);
                    uv.push(Wedges[Faces[i].Wedge[0]].V);
                    uv.push(Wedges[Faces[i].Wedge[1]].U);
                    uv.push(Wedges[Faces[i].Wedge[1]].V);
                    uv.push(Wedges[Faces[i].Wedge[2]].U);
                    uv.push(Wedges[Faces[i].Wedge[2]].V);
                }

                const uvs =  new Float32Array(uv);

                /*let indicesIncrement = 0;

                for(let i = 0; i < Faces.length; i++) {

                    indices[indicesIncrement++] = Faces[i].Wedge[0];
                    indices[indicesIncrement++] = Faces[i].Wedge[1];
                    indices[indicesIncrement++] = Faces[i].Wedge[2];
                }*/



                const texture = new THREE.TextureLoader().load('./T_Male_HazmatArmorMK1_01_BC.png');

                const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(posAttr), 3));
                geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
                //geometry.setIndex(indices/*new THREE.BufferAttribute(indices, 1)*/);
                geometry.computeVertexNormals();
                geometry.normalizeNormals();
                const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({map: texture, wireframe: false, side: THREE.DoubleSide}));
                //const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());

                onLoad(mesh);

            } catch(e) {

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

            const x = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const y = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const z = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            //tmp.push(x, z, y);
            tmp.push(new THREE.Vector3(x, z, y));
        }

        return tmp;
    }

    ReadWedges(size) {

        let Wedges = [];

        if (size < 65536) {

            for (let i = 0; i < size; i++) {

                Wedges[i] = {Pointindex: 0, /*Padding: 0,*/ U: 0, V: 0, MaterialIndex: 0/*, Reserved: 0, Padding2: 0*/};

                Wedges[i].Pointindex = this.DataView.getInt16(this.LastByte, true);
                this.LastByte += WedgesBytes.Pointindex;

                //Wedges[i].Padding = this.DataView.getInt16(this.LastByte, true);
                this.LastByte += WedgesBytes.Padding;

                Wedges[i].U = this.DataView.getFloat32(this.LastByte, true);
                this.LastByte +=  WedgesBytes.U;

                Wedges[i].V = this.DataView.getFloat32(this.LastByte, true);
                this.LastByte +=  WedgesBytes.V;

                Wedges[i].MaterialIndex = this.DataView.getInt8(this.LastByte, true);
                this.LastByte += WedgesBytes.MaterialIndex;

                //Wedges[i].Reserved = this.DataView.getInt8(this.LastByte, true);
                this.LastByte += WedgesBytes.Reserved;

                //Wedges[i].Padding2 = this.DataView.getInt16(this.LastByte, true);
                this.LastByte += WedgesBytes.Padding2;
            }
        } else {

            for (let i = 0; i < size; i++) {

                Wedges[i] = {Pointindex: 0, U: 0, V: 0, MaterialIndex: 0};

                Wedges[i].Pointindex = this.DataView.getInt32(this.LastByte, true);
                this.LastByte += Wedges32Bytes.Pointindex;

                Wedges[i].U = this.DataView.getFloat32(this.LastByte, true);
                this.LastByte +=  Wedges32Bytes.U;

                Wedges[i].V = this.DataView.getFloat32(this.LastByte, true);
                this.LastByte +=  Wedges32Bytes.V;

                Wedges[i].MaterialIndex = this.DataView.getInt32(this.LastByte, true);
                this.LastByte += Wedges32Bytes.MaterialIndex;

            }
        }

        return Wedges;
    }

    ReadFace(size) {

        let face = [];

        for (let i = 0; i < size; i++) {

            face[i] = {Wedge: [], Materialindex: 0, AuxMatIndex: 0, SmoothingGroups: 0};

            face[i].Wedge.push(this.DataView.getInt16(this.LastByte, true));
            this.LastByte += FaceBytes.Wedge;
            face[i].Wedge.push(this.DataView.getInt16(this.LastByte, true));
            this.LastByte += FaceBytes.Wedge;
            face[i].Wedge.push(this.DataView.getInt16(this.LastByte, true));
            this.LastByte += FaceBytes.Wedge;

            face[i].MaterialIndex = this.DataView.getInt8(this.LastByte, true);
            this.LastByte += FaceBytes.Materialindex;

            face[i].AuxMatIndex = this.DataView.getInt8(this.LastByte, true);
            this.LastByte += FaceBytes.AuxMatIndex;

            face[i].SmoothingGroups = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += FaceBytes.SmoothingGroups;
        }

        return face;
    }

    ReadMaterial(size, data) {

        let mat = [];

        for (let i = 0; i < size; i++) {

            mat[i] = {Name: '', TextureIndex: 0, PolyFlags: 0, AuxMaterial: 0, AuxFlags: 0, LodBias: 0, LodStyle: 0};

            mat[i].Name = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, MattBytes.Name)).split('\x00')[0];
            this.LastByte += MattBytes.Name;
    
            mat[i].TextureIndex = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += MattBytes.TextureIndex;
    
            mat[i].PolyFlags = this.DataView.getUint32(this.LastByte, true);
            this.LastByte += MattBytes.PolyFlags;
    
            mat[i].AuxMaterial = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += MattBytes.AuxMaterial;
    
            mat[i].AuxFlags = this.DataView.getUint32(this.LastByte, true);
            this.LastByte += MattBytes.AuxFlags;
    
            mat[i].LodBias = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += MattBytes.LodBias;
    
            mat[i].LodStyle = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += MattBytes.LodStyle;
        }

        return mat;
    }
};
export {PSKLoader}