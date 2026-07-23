/*
* @author lovepsone 2019 - 2024
*/

import * as THREE from './../libs/three.module.js';
import {PSALoader} from './PSALoader.js';

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
    PointIndex: 2, // bytes Int16
    Padding: 2, // bytes Int16
    U: 4, // bytes float32
    V: 4, // bytes float32
    MaterialIndex: 1, // bytes Int8
    Reserved: 1, // bytes Int8
    Padding2: 2 // bytes Int16
}; //total 16 bytes

const Wedges32Bytes = { // Count greater than 65536d
    PointIndex: 4, // bytes Int32
    U: 4, // bytes float32
    V: 4, // bytes float32
    MaterialIndex: 4 // bytes Int32
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

const BoneBytes = {
    Name: 64, // bytes String
    Flags: 4, // bytes uint32
    NumChildren: 4, // bytes int32
    Parentindex: 4, // bytes int32
    Rotation: 4 * 4, // bytes float32
    Position: 4 * 4, // bytes float32
    Length: 4, // bytes float32
    Size: 4 * 3 // bytes float32
}; //total 120 bytes

const RawBoneBytes = {
    Weight: 4, // bytes float32
    PointIndex: 4, // bytes int32
    BoneIndex: 4 // bytes int32
};

class PSKLoader extends THREE.Loader {

    constructor(manager) {

        super(manager);

        this.AnimLoader = new PSALoader();
        //this.Animations = [];
        this.LastByte = 0;
        this.ByteLength = 0;
        this.Points = [];
        this.Wedges = [];
        this.Faces = [];
        this.Material = [];
        this.Bones = [];
        this.RawBones = [];
    }

    loadAsync(Options, onProgress) {

        const scope = this;

        return new Promise(function(resolve, reject) {

            scope.load(Options, resolve, onProgress, reject);
        });
    }


    loadSkeletonAsync(url, onProgress) {

        const scope = this;

        return new Promise(function(resolve, reject) {

            scope.loadSkeleton(url, resolve, onProgress, reject);
        });
    }

    loadAndLOD(Options, onLoad, onProgress, onError) {

        const scope = this;
        let PromiseLoaders = [];

        if (!Array.isArray(Options.LOD)) {

            console.error('LOD is not array');
            return;
        }

        for(let i = 0; i < Options.LOD.length; i++) {

            const opt = {
                url: Options.LOD[i],
                PathMaterials: Options.PathMaterials
            };
            PromiseLoaders.push(scope.loadAsync(opt));
        }

        Promise.all(PromiseLoaders).then((geometryLOD)=> {
 
            scope.load(Options, function(geometry, textures, urlMaterial, skeleton) {

                onLoad(geometry, textures, urlMaterial, skeleton, geometryLOD);
            });

        }, (error) => {

            console.error(error);
        });
    }

    load(Options, onLoad, onProgress, onError) {

        const scope = this, loader = new THREE.FileLoader(this.manager);
        let resourcePath;

        if (this.resourcePath !== '') {

			resourcePath = this.resourcePath;
		} else if (this.path !== '') {

			resourcePath = this.path;
		} else {

			resourcePath = THREE.LoaderUtils.extractUrlBase(Options.url);
		}

        loader.setPath(this.path);
		loader.setResponseType('arraybuffer');
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(this.withCredentials);

        loader.load(Options.url, function(data) {

            try {
                const geometry = new THREE.BufferGeometry();
                scope.LastByte = 0;
                scope.ByteLength = 0;
                scope.Points = [];
                scope.Wedges = [];
                scope.Faces = [];
                scope.Material = [];
                scope.Bones = [];
                scope.RawBones = [];
                scope.ByteLength = data.byteLength;
                scope.DataView = new DataView(data);
                scope.parse(scope.HeaderChunk(data), data);

                Options.PathMaterials = Options.PathMaterials != undefined ? Options.PathMaterials : './';
                Options.Build = Options.Build != undefined ? Options.Build : true;

                let posAttr = [], indices = [], uv = [], indxMat = [{count: 0}], textures = [], PromiseLoaders = [];
                let VertInfStart = [], VertInfNum = [], count = 0, skinIndices = [], skinWeights = [];
                let Skeleton = false;
                const Points = scope.Points, Wedges = scope.Wedges, Faces = scope.Faces, Material = scope.Material, Bones = scope.Bones, RawBones = scope.RawBones;

                geometry.name = Options.url;

                for (let i = 0; i < RawBones.length; i++) {

                    count += 1;

                    if ((i == RawBones.length - 1) || (RawBones[i + 1].PointIndex != RawBones[i].PointIndex)) {

                        VertInfStart[RawBones[i].PointIndex] = i - count + 1;
                        VertInfNum[RawBones[i].PointIndex] = count;
                        count = 0;
                    }
                }

                for (let i = 0; i < Wedges.length; i++) {

                    posAttr.push(Points[Wedges[i].PointIndex].x, Points[Wedges[i].PointIndex].y, Points[Wedges[i].PointIndex].z);
                    uv.push(Wedges[i].U, Wedges[i].V);

                    if (RawBones.length > 0) {

                        const start   = VertInfStart[Wedges[i].PointIndex];
                        const numInfs = VertInfNum[Wedges[i].PointIndex];

                        for (let j = 0; j < 4; j++) {

                            if (j < numInfs) {

                                skinIndices.push(RawBones[start + j].BoneIndex);
                                skinWeights.push(RawBones[start + j].Weight);
                            } else {

                                skinIndices.push(0);
                                skinWeights.push(0);
                            }
                        }
                    }
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

                let listBone = [];

                if (Bones.length > 0) Bones[0].Rotation.conjugate(); // is apply conjugate()? or invert() ?

                for (let i = 0; i < Bones.length; i++) {

                    const b = new THREE.Bone();
                    b.name = Bones[i].Name.toLowerCase(); // fixed?
                    Bones[i].Rotation.conjugate();
                    b.applyQuaternion(Bones[i].Rotation);
                    b.position.copy(Bones[i].Position);
                    listBone.push(b);
                }

                for (let i = 1; i < Bones.length; i++) {

                    //if ( i > 1 && Bones[i].Parentindex != 0)
                    listBone[Bones[i].Parentindex].add(listBone[i]);
                }
                if (listBone.length > 0) {

                    Skeleton = new THREE.Skeleton(listBone);
                    Skeleton.calculateInverses();
                }

                if (Options.Build) {

                    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posAttr), 3));
                    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
                    geometry.setIndex(indices);

                    if (Skeleton) {

                        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
                        geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
                    }

                    geometry.computeVertexNormals();
                    geometry.computeBoundingBox();
                    geometry.normalizeNormals();
                    //geometry.clearGroups();
                }

                for (let i = 0; i < Material.length; i++) PromiseLoaders.push(new THREE.FileLoader().loadAsync(`${Options.PathMaterials}${Material[i].Name}.mat`));

                Promise.all(PromiseLoaders).then((values)=> {

                    for (let i = 0; i < values.length; i++) textures.push(scope.parseMaterial(values[i]));
                    if (Options.Build) {

                        onLoad(geometry, textures, Options, Skeleton);
                    } else {

                        geometry.dispose();
                        onLoad({position: posAttr, uv: uv, Index: indices, skinIndex: skinIndices, skinWeight: skinWeights, indexMaterial: indxMat}, textures, Options, Skeleton);
                    }
                }, (error) => {

                    console.error(error);
                });

            } catch(e) {

                console.error(e);
            }
        }, onProgress, onError);
    }

    loadSkeleton(url, onLoad, onProgress, onError) {

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
                scope.LastByte = 0;
                scope.ByteLength = 0;
                scope.Points = [];
                scope.Wedges = [];
                scope.Faces = [];
                scope.Material = [];
                scope.Bones = [];
                scope.RawBones = [];
                scope.ByteLength = data.byteLength;
                scope.DataView = new DataView(data);
                scope.parseToSkeleton(scope.HeaderChunk(data), data);

                let VertInfStart = [], VertInfNum = [], count = 0, skinIndices = [], skinWeights = []
                const Wedges = scope.Wedges, Bones = scope.Bones, RawBones = scope.RawBones;

                for (let i = 0; i < RawBones.length; i++) {

                    count += 1;

                    if ((i == RawBones.length - 1) || (RawBones[i + 1].PointIndex != RawBones[i].PointIndex)) {

                        VertInfStart[RawBones[i].PointIndex] = i - count + 1;
                        VertInfNum[RawBones[i].PointIndex] = count;
                        count = 0;
                    }
                }

                for (let i = 0; i < Wedges.length; i++) {

                    if (RawBones.length > 0) {

                        const start   = VertInfStart[Wedges[i].PointIndex];
                        const numInfs = VertInfNum[Wedges[i].PointIndex];

                        for (let j = 0; j < 4; j++) {

                            if (j < numInfs) {

                                skinIndices.push(RawBones[start + j].BoneIndex);
                                skinWeights.push(RawBones[start + j].Weight);
                            } else {

                                skinIndices.push(0);
                                skinWeights.push(0);
                            }
                        }
                    }
                }

                let listBone = [];

                if (Bones.length > 0) Bones[0].Rotation.conjugate(); // is apply conjugate()? or invert() ?

                for (let i = 0; i < Bones.length; i++) {

                    const b = new THREE.Bone();
                    b.name = Bones[i].Name.toLowerCase(); // fixed?
                    Bones[i].Rotation.conjugate();
                    b.applyQuaternion(Bones[i].Rotation);
                    b.position.copy(Bones[i].Position);
                    listBone.push(b);
                }

                for (let i = 1; i < Bones.length; i++) listBone[Bones[i].Parentindex].add(listBone[i]);
                if (listBone.length > 0) Skeleton = new THREE.Skeleton(listBone);
                onLoad({Skeleton: Skeleton, skinIndex: skinIndices, skinWeight: skinWeights});

            } catch(e) {

                console.error(e);
            }
        }, onProgress, onError);
    }

    parseToSkeleton(data, dataBytes) {

        switch(data.ChunkID) {

            case 'ACTRHEAD':
                break;

            case 'VTXW0000':
                this.Wedges = this.ReadWedges(data.DataCount);
                break;

            case 'REFSKELT':
                this.Bones = this.ReadBones(data.DataCount, dataBytes);
                break;

            case 'RAWWEIGHTS':
                this.RawBones = this.ReadRawBones(data.DataCount);
                break;

            default:
                this.LastByte = this.LastByte + data.DataCount * data.DataSize;
                break;
        }

        if (this.LastByte == this.ByteLength) return;
        this.parse(this.HeaderChunk(dataBytes), dataBytes);
    }

    parseMaterial(data) {

        const tmp = data.split('\r\n');
        let result = {Diffuse: null, Normal: null};

        if (tmp[0].split('=')[0] === 'Diffuse' && tmp[1].split('=')[0] == 'Normal') {

            result.Diffuse = tmp[0].split('=')[1];
            result.Normal = tmp[1].split('=')[1];
        } else if (tmp[0].split('=')[0] === 'Normal') result.Normal = tmp[0].split('=')[1];

        return result;//{Diffuse: tmp[0].split('=')[1], Normal: tmp[1].split('=')[1]};
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
                this.Bones = this.ReadBones(data.DataCount, dataBytes);
                break;

            case 'RAWWEIGHTS':
                this.RawBones = this.ReadRawBones(data.DataCount);
                break;

            case 'VERTEXCOLOR':
                this.LastByte = this.LastByte + data.DataCount * data.DataSize;
                break;

            default:
                this.LastByte = this.LastByte + data.DataCount * data.DataSize;
                break;
        }

        if (this.LastByte == this.ByteLength) return;
        this.parse(this.HeaderChunk(dataBytes), dataBytes);
    }

    HeaderChunk(data) {

        const id = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, HeaderBytes.ChunkID));
        this.LastByte += HeaderBytes.ChunkID;

        const flag = this.DataView.getUint32(this.LastByte, false);
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
            tmp.push(new THREE.Vector3(x, z, y *(-1)));
        }

        return tmp;
    }

    ReadWedges(size) {

        let Wedges = [];

        if (size < 65536) {

            for (let i = 0; i < size; i++) {

                Wedges[i] = {PointIndex: 0, /*Padding: 0,*/ U: 0, V: 0, MaterialIndex: 0/*, Reserved: 0, Padding2: 0*/};

                Wedges[i].PointIndex = this.DataView.getInt16(this.LastByte, true);
                this.LastByte += WedgesBytes.PointIndex;

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

                Wedges[i] = {PointIndex: 0, U: 0, V: 0, MaterialIndex: 0};

                Wedges[i].PointIndex = this.DataView.getInt32(this.LastByte, true);
                this.LastByte += Wedges32Bytes.PointIndex;

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

    ReadBones(size, data) {

        let bones = [];

        for (let i = 0; i < size; i++) {

            bones[i] = {};
            bones[i].Name = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, BoneBytes.Name)).split('\x00')[0];
            this.LastByte +=  BoneBytes.Name;

            bones[i].Flags = this.DataView.getUint32(this.LastByte, true);
            this.LastByte += BoneBytes.Flags;

            bones[i].NumChildren = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += BoneBytes.NumChildren;

            bones[i].Parentindex = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += BoneBytes.Parentindex;

            const rx = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const ry = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const rz = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const rw = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            bones[i].Rotation = new THREE.Quaternion(rx, rz, ry *(-1), rw);

            const px = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const py = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const pz = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            bones[i].Position = new THREE.Vector3(px, pz, py *(-1));

            bones[i].Length = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;

            const sx = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const sy = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const sz = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            bones[i].Size = new THREE.Vector3(sx, sz, sy);
        }
        return bones;
    }

    ReadRawBones(size) {

        let result = [];

        for (let i = 0; i < size; i++) {

            result[i] = {};
            result[i].Weight = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += RawBoneBytes.Weight;

            result[i].PointIndex = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += RawBoneBytes.PointIndex;

            result[i].BoneIndex = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += RawBoneBytes.BoneIndex;
        }
        return result;
    }
};
export {PSKLoader}