/*
* @author lovepsone 2019 - 2022
*/

import * as THREE from './../libs/three.module.js';
/*
    Chunks Headers :
    - ANIMHEAD: Does not contain a data pair.
    - BONENAMES: Array with the bone names.
    - ANIMINFO: Array of animation sequence info chunks.
    - ANIMKEYS: Array of raw keys.
*/

const HeaderBytes  = {
    ChunkID: 20, // bytes String
    TypeFlag: 4, // bytes UInt32
    DataSize: 4, // bytes Int32
    DataCount: 4 // bytes Int32
}; // total 32 bytes

const BoneNamesBytes = {
    Name: 64, // bytes String
    Flags: 4, // bytes uint32
    NumChildren: 4, // bytes int32
    Parentindex: 4, // bytes int32
    Rotation: 4 * 4, // bytes float32
    Position: 4 * 3, // bytes float32
    Length: 4, // bytes float32
    Size: 4 * 3 // bytes float32
}; // total 120 bytes

const AInfoBytes = {
    Name: 64,
    Group: 64,
    TotalBones: 4, // (int32) TotalBones * NumRawFrames is number of animation keys to digest.
    RootInclude: 4, // (int32) 0 none 1 included 	(unused)
    KeyCompressionStyle: 4, // (int32) Reserved: variants in tradeoffs for compression.
    KeyQuotum : 4, // (int32) Max key quotum for compression
    KeyReduction: 4, // (float32) // desired
    TrackTime: 4, // (float32) // explicit - can be overridden by the animation rate
    AnimRate: 4, // (float32) // frames per second.
    StartBone: 4, // (int32) - Reserved: for partial animations (unused)
    FirstRawFrame: 4, // (int32)
    NumRawFrames: 4 // (int32) NumRawFrames and AnimRate dictate tracktime...
}; // total 168 bytes

const AKeys = {
    Position: 4 * 3, // float32
    Orientation: 4 * 4, // float32
    Time: 4 // float32
}; // total 32 bytes

class PSALoader extends THREE.Loader {

    constructor(manager) {

        super(manager);

        this.LastByte = 0;
        this.ByteLength = 0;
        this.BoneNames = [];
        this.AnimInfo = [];
        this.AnimKeys = [];
    }

    load(url, BonesMesh, onLoad, onProgress, onError) {

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
                scope.BoneNames = [];
                scope.AnimInfo = [];
                scope.AnimKeys = [];
                scope.ByteLength = data.byteLength;
                scope.DataView = new DataView(data);
                scope.parse(scope.HeaderChunk(data), data);

                onLoad(scope.BbuildingSamplers(BonesMesh));
            } catch(e) {

                console.error(e);
            }
        }, onProgress, onError);
    }

    BbuildingSamplers(BonesMesh) {

        const scope = this; //check for empty AnimInfo, AnimKeys, BoneNames ?
        const Anim = scope.AnimInfo, AnimKeys = scope.AnimKeys, BonesAnim = scope.BoneNames;
        let result = [];

        for (let i = 0; i < Anim.length; i++) {

            const CurrFrameAnim = Anim[i].FirstRawFrame * Anim[i].TotalBones;
            const countFrames = Anim[i].NumRawFrames;
            const RateScale = (Anim[i].AnimRate > 0.001) ? 1. / Anim[i].AnimRate : 1.;

            let quat = [], pos = [], KeyframeTracks = [], times = [];

            for (let Frame = 0; Frame < countFrames; Frame++) {

                for (let bone = 0; bone < Anim[i].TotalBones; bone++) {

                    if (quat[bone] == undefined) quat[bone] = [];
                    if (pos[bone] == undefined) pos[bone] = [];
                    if (times[bone] == undefined) times[bone] = [];

                    if (BonesMesh[bone] && BonesMesh[bone].name.toLowerCase() == BonesAnim[bone].name.toLowerCase()) {

                        const id = CurrFrameAnim + Frame * Anim[i].TotalBones + bone;
                        const time = Anim[i].AnimRate / (Anim[i].TrackTime) / 3;
                        if (bone == 0) AnimKeys[id].Orientation.invert();
                        quat[bone].push(... AnimKeys[id].Orientation.toArray());
                        pos[bone].push(... AnimKeys[id].Position.toArray());
                        //times[bone].push(time * Frame);
                        times[bone].push(RateScale * Frame);
                    }
                }
            }

            for (let j = 0; j < Anim[i].TotalBones; j++) {

                if (BonesMesh[j] && BonesMesh[j].name.toLowerCase() == BonesAnim[j].name.toLowerCase()) {

                    const t = new Float32Array(times[j]);
                    const p = new Float32Array(pos[j]);
                    const q = new Float32Array(quat[j]);
                    KeyframeTracks.push(new THREE.VectorKeyframeTrack(`${BonesMesh[j].name}.position`, t, p));
                    KeyframeTracks.push(new THREE.QuaternionKeyframeTrack(`${BonesMesh[j].name}.quaternion`, t, q));
                }
            }

            result.push(new THREE.AnimationClip(scope.AnimInfo[i].Name, undefined,  KeyframeTracks));
        }

        return result;
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

    parse(data, dataBytes) {

        switch(data.ChunkID) {

            case 'ACTRHEAD':
                break;

            case 'BONENAMES':
                this.BoneNames = this.ReadBoneNames(data.DataCount, dataBytes);
                break;

            case 'ANIMINFO':
                this.AnimInfo = this.ReadInfoAnim(data.DataCount, dataBytes);
                break;

            case 'ANIMKEYS':
                this.AnimKeys = this.ReadAnimKeys(data.DataCount);
                break;

            case 'SCALEKEYS':
                this.LastByte = this.LastByte + data.DataCount * data.DataSize;
                break;

            default:
                this.LastByte = this.LastByte + data.DataCount * data.DataSize;
                break;
        }

        if (this.LastByte == this.ByteLength) return;
        this.parse(this.HeaderChunk(dataBytes), dataBytes);
    }

    ReadBoneNames(size, data) {

        let bones = [];

        for (let i = 0; i < size; i++) {

            bones[i] = {};
            bones[i].name = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, BoneNamesBytes.Name)).split('\x00')[0];
            this.LastByte +=  BoneNamesBytes.Name;

            bones[i].Flags = this.DataView.getUint32(this.LastByte, true);
            this.LastByte += BoneNamesBytes.Flags;

            bones[i].NumChildren = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += BoneNamesBytes.NumChildren;

            bones[i].Parentindex = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += BoneNamesBytes.Parentindex;

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

    ReadInfoAnim(size, data) {

        let infoAnim = [];

        for (let i = 0; i < size; i++) {

            infoAnim[i] = {};
            infoAnim[i].Name = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, AInfoBytes.Name)).split('\x00')[0];
            this.LastByte +=  AInfoBytes.Name;
            infoAnim[i].Group = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, AInfoBytes.Group)).split('\x00')[0];
            this.LastByte +=  AInfoBytes.Group;

            infoAnim[i].TotalBones = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += AInfoBytes.TotalBones;

            infoAnim[i].RootInclude = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += AInfoBytes.RootInclude;

            infoAnim[i].KeyCompressionStyle = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += AInfoBytes.KeyCompressionStyle;

            infoAnim[i].KeyQuotum = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += AInfoBytes.KeyQuotum;

            infoAnim[i].KeyReduction = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += AInfoBytes.KeyReduction;

            infoAnim[i].TrackTime = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += AInfoBytes.TrackTime;

            infoAnim[i].AnimRate = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += AInfoBytes.AnimRate;

            infoAnim[i].StartBone = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += AInfoBytes.StartBone;

            infoAnim[i].FirstRawFrame = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += AInfoBytes.FirstRawFrame;

            infoAnim[i].NumRawFrames = this.DataView.getInt32(this.LastByte, true);
            this.LastByte += AInfoBytes.NumRawFrames;
        }
        return infoAnim;
    }

    ReadAnimKeys(size) {

        let keys = [];

        for (let i = 0; i < size; i++) {

            keys[i] = {};

            const px = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const py = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const pz = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            keys[i].Position = new THREE.Vector3(px, pz, py *(-1));

            const rx = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const ry = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const rz = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const rw = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            keys[i].Orientation = new THREE.Quaternion(rx, rz, ry*(-1), rw*(-1));

            keys[i].Time =  this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += AKeys.Time;
        }
        return keys;
    }
};

export {PSALoader}