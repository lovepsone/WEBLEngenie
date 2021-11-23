/*
* @author lovepsone 2019 - 2021
*/

const VERSION = 3;
const TYPE = 'wgle';
let EROOR = 0;
let _sizeTerrain = 64, _count = _sizeTerrain * _sizeTerrain;
let _countRoads = 0;

let bytes = {
    Type: 4, // Uint8 * 4
    Version: 1, // Uint8
    Size: 2, // Uint16
    Points: 4, // Float32
    Colors: 4 * 3, // Float32
    CountRoads: 2, // Uint16
    total: 0
};

let PosByte = {
    Type: 0,
    Version: 0,
    Size: 0,
    Points: 0,
    Colors: 0,
    CountRoads: 0
};

const BytesRoad = { //structure of one road

    ColorR: 1, // Uint8
    ColorB: 1, // Uint8
    WeightR: 1, // Uint8
    WeightB: 1, // Uint8
    CountPoints: 2, // Uint16
    Points: 4, // Float32
}

class FilerProject {

    constructor(SizeTerain = 64) {

        _sizeTerrain = SizeTerain;
        _count = SizeTerain * SizeTerain;
        this.clearBytes();
    }

    newData(CountRoads = 0, CountPoints = 0) {

        // есть баг сохранения, если рамер терраина был изменен
        this.clearBytes();
        this.data = null;
        const fullBR = 2 * BytesRoad.ColorR * CountRoads + 2 * BytesRoad.WeightR * CountRoads + BytesRoad.Points * CountPoints + BytesRoad.CountPoints * CountRoads;
        this.data = new DataView(new ArrayBuffer(bytes.total + fullBR));
        this.setChunk('type');
        this.setChunk('version');
        this.setChunk('size');
    }

    setDataRoadsChunk(data) {

        let LastPosByte = PosByte.CountRoads + bytes.CountRoads;

        for (let i = 0; i < data.length - 1; i++) {

            this.data.setUint8(LastPosByte, data[i].colorR);
            LastPosByte = LastPosByte + BytesRoad.ColorR;
            this.data.setUint8(LastPosByte, data[i].colorB);
            LastPosByte = LastPosByte + BytesRoad.ColorB;

            this.data.setUint8(LastPosByte, data[i].weightR);
            LastPosByte = LastPosByte + BytesRoad.WeightR;
            this.data.setUint8(LastPosByte, data[i].weightB);
            LastPosByte = LastPosByte + BytesRoad.WeightB;

            this.data.setUint16(LastPosByte, data[i].length);
            LastPosByte = LastPosByte + BytesRoad.CountPoints;

            // data[j].point = 4 * 3 byte
            for (let j = 0; j < data[i].length; j++) {

                this.data.setFloat32(LastPosByte, data[i].point[j].x);
                LastPosByte += 4;
                this.data.setFloat32(LastPosByte, data[i].point[j].y);
                LastPosByte += 4;
                this.data.setFloat32(LastPosByte, data[i].point[j].z);
                LastPosByte += 4;
            }
        }
    }

    readDataRoadsChunk() {

        let LastPosByte = PosByte.CountRoads + bytes.CountRoads;
        let data = [];

        for (let i = 0; i < _countRoads; i++) {

            data[i] = {
                point: [],
                colorR: 0,
                colorB: 0,
                weightR: 0,
                weightB: 0,
                length: 0
            };
            data[i].colorR = this.data.getUint8(LastPosByte);
            LastPosByte = LastPosByte + BytesRoad.ColorR;
            data[i].colorB = this.data.getUint8(LastPosByte);
            LastPosByte = LastPosByte + BytesRoad.ColorB;

            data[i].weightR = this.data.getUint8(LastPosByte);
            LastPosByte = LastPosByte + BytesRoad.WeightR;
            data[i].weightB = this.data.getUint8(LastPosByte);
            LastPosByte = LastPosByte + BytesRoad.WeightB;

            data[i].length = this.data.getUint16(LastPosByte);
            LastPosByte = LastPosByte + BytesRoad.CountPoints;

            for (let j = 0; j < data[i].length; j++) {

                data[i].point.push(this.data.getFloat32(LastPosByte)); // x
                LastPosByte += 4;
                data[i].point.push(this.data.getFloat32(LastPosByte)); // y
                LastPosByte += 4;
                data[i].point.push(this.data.getFloat32(LastPosByte)); // z
                LastPosByte += 4;
            }
        }

        return data;
    }

    setChunk(name, value = 0, offset = 0) {

        let tmp = [];

        switch(name) {

            case 'type':
                tmp = new TextEncoder().encode(TYPE);
                for (let i = 0; i < tmp.length; i++) this.data.setUint8(PosByte.Type + i, tmp[i]);
                break;

            case 'version':
                this.data.setUint8(PosByte.Version, VERSION);
                break;

            case 'size':
                if (value == 0) {

                    this.data.setUint16(PosByte.Size, _sizeTerrain);
                } else {

                    this.data.setUint16(PosByte.Size, value);
                }
                break;

            case 'points':
                this.data.setFloat32(PosByte.Points + offset * 4, value);
                break;

            case 'colors':
                this.data.setFloat32(PosByte.Colors + offset * 4, value);
                break;

            case 'countroads':
                this.data.setUint16(PosByte.CountRoads, value);
                _countRoads = value;
                break;
        }
    }

    readChunk(name,  offset = 0) {

        if (EROOR) return;
        let val = 0, tmp = [];

        switch(name) {

            case 'type':
                for (let i = 0; i < 4; i++) tmp.push(this.data.getUint8(PosByte.Type + i));
                if (new TextDecoder().decode(new Uint8Array(tmp)) != TYPE) EROOR = 1;
                break;

            case 'version':
                val = this.data.getUint8(PosByte.Version);
                break;

            case 'size':
                _sizeTerrain =  this.data.getUint16(PosByte.Size);
                _count = _sizeTerrain * _sizeTerrain;
                bytes.Points = bytes.Points * _count;
                bytes.Colors = bytes.Colors * _count;
                bytes.total =  bytes.Type + bytes.Version +  bytes.Size +  bytes.Points +  bytes.Colors;
                PosByte.Points = PosByte.Size + bytes.Size;
                PosByte.Colors = PosByte.Points + bytes.Points;
                PosByte.CountRoads = PosByte.Colors + bytes.Colors;
                break;

            case 'points':
                val = this.data.getFloat32(PosByte.Points + offset * 4);
                break;

            case 'colors':
                val = this.data.getFloat32(PosByte.Colors + offset * 4);
                break;

            case 'countroads':
                val = this.data.getUint16(PosByte.CountRoads);
                _countRoads = val;
                break;
        }

        return val;
    }

    getData() {

        return this.data;
    }

    getVersionReader() {

        if (this.readChunk('version') == VERSION)
            return true;
    }

    setBytes(byteArray) {

        this.clearBytes();
        bytes.Points = 4;
        bytes.Colors = 4 * 3;
        this.data = null;
        this.data = new DataView(byteArray);
        this.readChunk('type');
        this.readChunk('size');
        return _sizeTerrain;
    }

    clearBytes() {

        bytes = {
            Type: 4, // Uint8 * 4
            Version: 1, // Uint8
            Size: 2, // Uint16
            Points: 4, // Float32
            Colors: 4 * 3, // Float32
            CountRoads: 2, // Uint16
            total: 0
        };

        PosByte = {
            Type: 0,
            Version: 0,
            Size: 0,
            Points: 0,
            Colors: 0,
            CountRoads: 0
        };

        bytes.Points = bytes.Points * _count;
        bytes.Colors = bytes.Colors * _count;
        bytes.total =  bytes.Type + bytes.Version +  bytes.Size +  bytes.Points + bytes.Colors + bytes.CountRoads;

        PosByte.Version += bytes.Type;
        PosByte.Size =  PosByte.Version + bytes.Version;
        PosByte.Points = PosByte.Size + bytes.Size;
        PosByte.Colors = PosByte.Points + bytes.Points;
        PosByte.CountRoads = PosByte.Colors + bytes.Colors;
    }
}

export {FilerProject};