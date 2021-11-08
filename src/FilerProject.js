/*
* @author lovepsone 2019 - 2021
*/

const VERSION = 1;

let _sizeTerrain = 64, _count = _sizeTerrain * _sizeTerrain;
let bytes = {
    Version: 1, // Uint8
    Size: 2, // Uint16
    Points: 4, // Float32
    Colors: 4 * 3, // Float32
    total: 0
};

let PosByte = {
    Version: 0,
    Size: 0,
    Points: 0,
    Colors: 0
};

class FilerProject {

    constructor(SizeTerain = 64) {

        _sizeTerrain = SizeTerain;
        _count = SizeTerain * SizeTerain;

        bytes.Points = bytes.Points * _count;
        bytes.Colors = bytes.Colors * _count;
        bytes.total =  bytes.Version +  bytes.Size +  bytes.Points +  bytes.Colors;

        PosByte.Size +=  bytes.Version;
        PosByte.Points = PosByte.Size + bytes.Size;
        PosByte.Colors = PosByte.Points + bytes.Points;
    }

    newData() {

        this.data = new DataView(new ArrayBuffer(bytes.total));
        this.setChunk('version');
        this.setChunk('size');
    }

    setChunk(name, value = 0, offset = 0) {

        switch(name) {

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
        }
    }

    readChunk(name,  offset = 0) {

        let val = 0;
        switch(name) {

            case 'version':
                break;

            case 'size':
                PosByte.Size +=  bytes.Version;
                _sizeTerrain =  this.data.getUint16(PosByte.Size);
                _count = _sizeTerrain * _sizeTerrain;
                bytes.Points = bytes.Points * _count;
                bytes.Colors = bytes.Colors * _count;
                bytes.total =  bytes.Version +  bytes.Size +  bytes.Points +  bytes.Colors;
                PosByte.Points = PosByte.Size + bytes.Size;
                PosByte.Colors = PosByte.Points + bytes.Points;
                break;

            case 'points':
                val = this.data.getFloat32(PosByte.Points + offset * 4);
                break;

            case 'colors':
                val = this.data.getFloat32(PosByte.Colors + offset * 4);
                break;
        }

        return val;
    }

    getData() {

        return this.data;
    }

    setBytes(byteArray) {

        PosByte.Size = 0;
        bytes.Points = 4;
        bytes.Colors = 4 * 3;
        this.data = new DataView(byteArray);
        this.readChunk('size');
        return _sizeTerrain;
    }
}

export {FilerProject};