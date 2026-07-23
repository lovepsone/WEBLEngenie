/*
* @author lovepsone 2019 - 2024
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

    loadAsync(Options, onProgress) {

        const scope = this;

        return new Promise(function(resolve, reject) {

            scope.load(Options, resolve, onProgress, reject);
        });
    }

    loadList(list, onLoad, onProgress, onError) {

        const scope = this;
        let PromiseLoaders = [];

        if (!Array.isArray(list)) {

            console.error('list anims is not array');
            return;
        }

        for(let i = 0; i < list.length; i++) {

            const opt = {
                url: list[i].file,
                urlCfg: list[i].conf
            };

            PromiseLoaders.push(scope.loadAsync(opt));
        }

        Promise.all(PromiseLoaders).then((anims)=> {

            onLoad(anims);

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

                scope.LastByte = 0;
                scope.ByteLength = 0;
                scope.BoneNames = [];
                scope.AnimInfo = [];
                scope.AnimKeys = [];
                scope.ByteLength = data.byteLength;
                scope.DataView = new DataView(data);
                scope.parse(scope.HeaderChunk(data), data);

                // load config
                let cfgAnim = {};
                const Anim = scope.AnimInfo, AnimKeys = scope.AnimKeys, BonesAnim = scope.BoneNames;

                /*
                bloks type
                [AnimSet] mode 1 - bAnimRotationOnly 1(false), 0(true)
                [UseTranslationBoneNames] mode 2 - use translation from animation, useful with bAnimRotationOnly=true only
                [ForceMeshTranslationBoneNames] mode 3 - use translation from mesh
                [RemoveTracks] mode 4, flag = trans - NO_TRANSLATION, rot - NO_ROTATION, all - NO_TRANSLATION | NO_ROTATION
                */
                new THREE.FileLoader().loadAsync(Options.urlCfg).then((values)=> {

                    const bloks = values.split(' ');

                    for (let i = 0; i < bloks.length; i++) {

                        const tmp =  bloks[i].split('\r\n');

                        tmp[1] = tmp[1].replace(/[\[\]']+/g, '');

                        for (let j = 2; j < tmp.length ; j++) {

                            if (tmp[j] == '') continue;

                            const name = tmp[j].split('.')[0];
                            const bone = tmp[j].split('.')[1].split('=')[0];
                            const flag = tmp[j].split('.')[1].split('=')[1];

                            if (!Array.isArray(cfgAnim[name])) cfgAnim[name] = [];
                            cfgAnim[name][bone] = {mode: tmp[1], flag: flag};
                        }
                    }

                    let animation = [], prepareBones = [];

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

                                const id = CurrFrameAnim + Frame * Anim[i].TotalBones + bone;
                                const time = Anim[i].AnimRate / (Anim[i].TrackTime) / 3;

                                if (bone == 0) AnimKeys[id].Orientation.conjugate();

                                quat[bone].push(... AnimKeys[id].Orientation.toArray());
                                pos[bone].push(... AnimKeys[id].Position.toArray());

                                //times[bone].push(time * Frame);
                                times[bone].push(RateScale * Frame);
                            }
                        }


                        for (let j = 0; j < Anim[i].TotalBones; j++) {

                            if (cfgAnim[Anim[i].Name][j] !== undefined) {

                                /*
                                bloks type
                                [AnimSet] mode 1 - bAnimRotationOnly 1(false), 0(true)
                                [UseTranslationBoneNames] mode 2 - use translation from animation, useful with bAnimRotationOnly=true only
                                [ForceMeshTranslationBoneNames] mode 3 - use translation from mesh
                                [RemoveTracks] mode 4, flag = trans - NO_TRANSLATION, rot - NO_ROTATION, all - NO_TRANSLATION | NO_ROTATION
                                */
                                switch(cfgAnim[Anim[i].Name][j].mode) {

                                    case 'AnimSet':
                                        break;

                                    case 'UseTranslationBoneNames':
                                        break;

                                    case 'ForceMeshTranslationBoneNames':
                                        break;

                                    case 'RemoveTracks': {

                                        switch(cfgAnim[Anim[i].Name][j].flag) {

                                            case 'trans': {

                                                    const t = new Float32Array(times[j]);
                                                    const q = new Float32Array(quat[j]);
                                                    KeyframeTracks.push(new THREE.QuaternionKeyframeTrack(`${BonesAnim[j].name.toLowerCase()}.quaternion`, t, q));
                                                }
                                                break;

                                            case 'rot': {

                                                    const t = new Float32Array(times[j]);
                                                    const p = new Float32Array(pos[j]);
                                                    KeyframeTracks.push(new THREE.VectorKeyframeTrack(`${BonesAnim[j].name.toLowerCase()}.position`, t, p));
                                                }
                                                break;

                                            case 'all': {
                                                }
                                                break;
                                        }
                                    }
                                        break;
                                }
                            } else {

                                const t = new Float32Array(times[j]);
                                const p = new Float32Array(pos[j]);
                                const q = new Float32Array(quat[j]);
                                KeyframeTracks.push(new THREE.VectorKeyframeTrack(`${BonesAnim[j].name.toLowerCase()}.position`, t, p));
                                KeyframeTracks.push(new THREE.QuaternionKeyframeTrack(`${BonesAnim[j].name.toLowerCase()}.quaternion`, t, q));
                            }
                        }

                        animation.push(new THREE.AnimationClip(Anim[i].Name, undefined,  KeyframeTracks));
                        prepareBones.push(BonesAnim);
                    }

                    onLoad({animation, prepareBones});
                }, (error) => {

                    console.error(error);
                });
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
            bones[i].name = THREE.LoaderUtils.decodeText(new Uint8Array(data, this.LastByte, BoneNamesBytes.Name)).split('\x00')[0];
            bones[i].name = bones[i].name.toLowerCase();
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