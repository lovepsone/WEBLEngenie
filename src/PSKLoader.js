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
     - VERTEXCOLOR: Vertex colors.
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
    MaterialIndex: 1, // bytes Int8
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
        this.ByteLength = 0;
        this.Points = [];
        this.Wedges = [];
        this.Faces = [];
        this.Material = [];
        this.Materials = null;
    }

    load(url, pathMat, onLoad, onProgress, onError) {

        const scope = this, loader = new THREE.FileLoader(this.manager), geometry = new THREE.BufferGeometry();
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

                scope.ByteLength = data.byteLength;
                scope.DataView = new DataView(data);
                scope.parse(scope.HeaderChunk(data), data);

                let posAttr = [], indices = [], uv = [], indxMat = [{count: 0}], materials = [];
                const Points = scope.Points, Wedges = scope.Wedges, Faces = scope.Faces, Material = scope.Material;

                for (let i = 0; i < Wedges.length; i++) {

                    posAttr.push(Points[Wedges[i].Pointindex].x, Points[Wedges[i].Pointindex].y, Points[Wedges[i].Pointindex].z);
                    uv.push(Wedges[i].U, Wedges[i].V);
                }

                for (let i = 0; i < Faces.length; i++) {

                    indices.push(Faces[i].Wedge[1], Faces[i].Wedge[0], Faces[i].Wedge[2]);

                    if (indxMat[Faces[i].MaterialIndex] == undefined) indxMat[Faces[i].MaterialIndex] = {count: 0};
                    indxMat[Faces[i].MaterialIndex].count++;

                }

                let start = 0;

                for (let i = 0; i < indxMat.length; i++) {

                    geometry.addGroup(start, indxMat[i].count * 3, i);
                    start += indxMat[i].count * 3;
                }

                for (let i = 0; i < Material.length; i++) {

                    new THREE.FileLoader().load(`${pathMat}${Material[i].Name}.mat`, function(data) {
                        const texture = new THREE.TextureLoader().load(`${pathMat}${scope.parseMaterial(data).Diffuse}.png`);
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        materials.push(new THREE.MeshBasicMaterial({map: texture, wireframe: false, side: THREE.DoubleSide}));
                    });
                }

                geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posAttr), 3));
                geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
                geometry.setIndex(indices);
                geometry.computeVertexNormals();

                const mesh = new THREE.Mesh(geometry, materials);
                onLoad(mesh);

            } catch(e) {

                console.error(e);
            }
        }, onProgress, onError);
    }

    parseMaterial(data) {

        const tmp = data.split('\r\n');

        return {Diffuse: tmp[0].split('=')[1], Normal: tmp[1].split('=')[1]};
    }
 
    parse(data, dataBytes) {

        switch(data.ChunkID) {

            case 'ACTRHEAD':
                break;

            case 'PNTS0000':
                this.Points = this.ReadPoints(data.DataCount);
                break;

            case 'VTXW0000':
                this.Wedges = this.ReadWedges(data.DataCount);
                break;

            case 'FACE0000':
                this.Faces = this.ReadFace(data.DataCount);
                break;

            case 'MATT0000':
                this.Material = this.ReadMaterial(data.DataCount, dataBytes);
                break;

            case 'REFSKELT':
                this.LastByte = this.LastByte + data.DataCount * data.DataSize;
                break;

            case 'RAWWEIGHTS':
                console.log(data)
                this.LastByte = this.LastByte + data.DataCount * data.DataSize;
                break;

            case 'VERTEXCOLOR':
                this.LastByte = this.LastByte + data.DataCount * data.DataSize;
                break;

            //EXTRAUV
        }

        if (this.LastByte == this.ByteLength) return;
        this.parse(this.HeaderChunk(dataBytes), dataBytes);
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

                this.LastByte += WedgesBytes.Padding;

                Wedges[i].U = this.DataView.getFloat32(this.LastByte, true);
                this.LastByte +=  WedgesBytes.U;

                Wedges[i].V = 1.0 - this.DataView.getFloat32(this.LastByte, true);
                this.LastByte +=  WedgesBytes.V;

                Wedges[i].MaterialIndex = this.DataView.getInt8(this.LastByte, true);
                this.LastByte += WedgesBytes.MaterialIndex;

                this.LastByte += WedgesBytes.Reserved;
                this.LastByte += WedgesBytes.Padding2;
            }
        } else {

            for (let i = 0; i < size; i++) {

                Wedges[i] = {Pointindex: 0, U: 0, V: 0, MaterialIndex: 0};

                Wedges[i].Pointindex = this.DataView.getInt32(this.LastByte, true);
                this.LastByte += Wedges32Bytes.Pointindex;

                Wedges[i].U = this.DataView.getFloat32(this.LastByte, true);
                this.LastByte +=  Wedges32Bytes.U;

                Wedges[i].V = 1.0 - this.DataView.getFloat32(this.LastByte, true);
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

            face[i] = {Wedge: [], MaterialIndex: 0, AuxMatIndex: 0, SmoothingGroups: 0};

            face[i].Wedge.push(this.DataView.getInt16(this.LastByte, true));
            this.LastByte += FaceBytes.Wedge;
            face[i].Wedge.push(this.DataView.getInt16(this.LastByte, true));
            this.LastByte += FaceBytes.Wedge;
            face[i].Wedge.push(this.DataView.getInt16(this.LastByte, true));
            this.LastByte += FaceBytes.Wedge;

            face[i].MaterialIndex = this.DataView.getInt8(this.LastByte, true);
            this.LastByte += FaceBytes.MaterialIndex;

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