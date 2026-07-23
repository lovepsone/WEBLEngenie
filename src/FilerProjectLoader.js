/*
* @author lovepsone 2019 - 2026
*/

const VERSION = 1, TYPE = 'wgle';
let EROOR = 0;

let _option = {

    size: 64,
    countPoints : 64 * 64,
}

let _BytesFile = {

    Type: 4, // Uint8 * 4
    Version: 1, // Uint8
    Size: 2, // Uint16
    Points: 4, // Float32
    Colors: 4 * 3, // Float32
    total: 0
};

let _PositionByte = {
    Type: 0,
    Version: 0,
    Size: 0,
    Points: 0,
    Colors: 0,
};

export class FilerWEBLELoader {

    constructor(byteArray) {

        this.ClearBytes();

        _BytesFile.Points = 4;
        _BytesFile.Colors = 4 * 3;
        this.data = null;
        this.data = new DataView(byteArray);
        this.readChunk('type');
        this.readChunk('size');
    }

    getSize() {

        return _option.size;
    }

    readChunk(name,  offset = 0) {

        if (EROOR) return;
        let val = 0, tmp = [];

        switch(name) {

            case 'type':
                for (let i = 0; i < 4; i++) tmp.push(this.data.getUint8(_PositionByte.Type + i));
                if (new TextDecoder().decode(new Uint8Array(tmp)) != TYPE) EROOR = 1;
                break;

            case 'version':
                val = this.data.getUint8(_PositionByte.Version);
                break;

            case 'size':
                _option.size =  this.data.getUint16(_PositionByte.Size);
                _option.countPoints = _option.size * _option.size;
    
                _BytesFile.Points = _BytesFile.Points * _option.countPoints;
                _BytesFile.Colors = _BytesFile.Colors * _option.countPoints;
                _BytesFile.total = _BytesFile.Type + _BytesFile.Version + _BytesFile.Size + _BytesFile.Points + _BytesFile.Colors;

                _PositionByte.Points = _PositionByte.Size + _BytesFile.Size;
                break;

            case 'points':
                val = this.data.getFloat32(_PositionByte.Points + offset * 4);
                break;

            case 'colors':
                val = this.data.getFloat32(_PositionByte.Colors + offset * 4);
                break;
        }

        return val;
    }

    getVersionReader() {

        if (this.readChunk('version') === VERSION)
            return true;

        return false;
    }

    ClearBytes() {

        _BytesFile = {
            Type: 4, // Uint8 * 4
            Version: 1, // Uint8
            Size: 2, // Uint16
            Points: 4, // Float32
            Colors: 4 * 3, // Float32
            total: 0
        };

        _BytesFile.Points = _BytesFile.Points * _option.countPoints;
        _BytesFile.Colors = _BytesFile.Colors * _option.countPoints;
        _BytesFile.total =  _BytesFile.Type + _BytesFile.Version +  _BytesFile.Size +  _BytesFile.Points + _BytesFile.Colors;

        _PositionByte.Version += _BytesFile.Type;
        _PositionByte.Size =  _PositionByte.Version +  _BytesFile.Version;
        _PositionByte.Points =  _PositionByte.Size +_BytesFile.Size;
        _PositionByte.Colors = _PositionByte.Points + _BytesFile.Points;
    }
}