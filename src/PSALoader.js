/*
* @author lovepsone 2019 - 2021
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
                scope.LastByte = 0;
                scope.ByteLength = 0;
                scope.BoneNames = [];
                scope.AnimInfo = [];
                scope.AnimKeys = [];
                scope.ByteLength = data.byteLength;
                scope.DataView = new DataView(data);
                scope.parse(scope.HeaderChunk(data), data);

                console.log(scope.BoneNames);
                console.log(scope.AnimInfo);
                //console.log(scope.AnimKeys);
                const AnimKeys = scope.AnimKeys, Bones = scope.BoneNames;
                let result = [];

                 for (let i = 0; i < scope.AnimInfo.length; i++) {

                    const currentKeys = scope.AnimInfo[i].FirstRawFrame * scope.AnimInfo[i].TotalBones;
                    const countFrames = scope.AnimInfo[i].NumRawFrames;
                    const TotalBones = scope.AnimInfo[i].TotalBones;

                    let quat = [], pos = [], KeyframeTracks = [], times = [];

                    for (let f = 0; f < countFrames; f++) {

                        for (let b = 0; b < TotalBones; b++) {

                            if (quat[b] == undefined) quat[b] = [];
                            if (pos[b] == undefined) pos[b] = [];
                            if (times[b] == undefined) times[b] = [];

                            const id = currentKeys + f * TotalBones + b;
                            const time = scope.AnimInfo[i].AnimRate / (scope.AnimInfo[i].TrackTime - 1) / 100;
                            quat[b].push(... AnimKeys[id].Orientation.toArray());
                            pos[b].push(... AnimKeys[id].Position.toArray());
                            times[b].push(time * f);
                        }
                    }

                    for (let i = 0; i < TotalBones; i++) {

                        KeyframeTracks.push(new THREE.VectorKeyframeTrack(Bones[i].Name +'.position', new Float32Array(times[i]), new Float32Array(pos[i])));
                        KeyframeTracks.push(new THREE.QuaternionKeyframeTrack(Bones[i].Name +'.quaternion', new Float32Array(times[i]), new Float32Array(quat[i])));
                    }

                    result.push(new THREE.AnimationClip(scope.AnimInfo[0].Name, undefined,  KeyframeTracks));
                }
                onLoad(result);
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
            bones[i].Name = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, BoneNamesBytes.Name)).split('\x00')[0];
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
            bones[i].Rotation = new THREE.Quaternion(rx, rz, ry, rw);
            //bones[i].Rotation = new THREE.Quaternion(rx, ry, rz, rw);

            const px = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const py = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const pz = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            bones[i].Position = new THREE.Vector3(px, pz, py);
            //bones[i].Position = new THREE.Vector3(px, py, pz);

            bones[i].Length = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;

            const sx = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const sy = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const sz = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            bones[i].Size = new THREE.Vector3(sx, sz, sy);
            //bones[i].Size = new THREE.Vector3(sx, sy, sz);
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
            keys[i].Position = new THREE.Vector3(px, pz, py);
            //keys[i].Position = new THREE.Vector3(px, py, pz);

            const rx = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const ry = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const rz = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            const rw = this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += 4;
            keys[i].Orientation = new THREE.Quaternion(rx, rz, ry, rw);
            //keys[i].Orientation = new THREE.Quaternion(rx, ry, rz, rw);

            keys[i].Time =  this.DataView.getFloat32(this.LastByte, true);
            this.LastByte += AKeys.Time;
        }
        return keys;
    }
};

export {PSALoader}