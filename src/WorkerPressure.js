/*
* author lovepsone
*/

//importScripts('./');

let _radius = 0.5, _strength = 0.005, _attr = [];

class WorkerPressure {

	constructor() {

    }

    setRadius(r) {

        _radius = r;
    }

    setStrength(s) {

        _strength = s;
    }

    pressure(_position, _point) {

        let r = 0, result = [], j = 0;

		for (let i = 0; i < _position.length; i += 3) {
			//(x � x_0)^2 + (y � y_0)^2 <= R^2
			if (_radius  > (r = Math.pow((_point.x - _position[i]), 2) + Math.pow((_point.z - _position[i+2]),2))) {
                _position[i+1] += _strength;
                result[j] = {i: i+1, v: _position[i+1]};
                j++;
			}
        }
        
        return result;
    }
}

let _pressure = new  WorkerPressure();

self.onmessage = function(e) {

    let data = e.data;

    switch(data.cmd) {

        case 'start':
            break;
        case 'stop':
            self.close()
            break;
        case 'radius':
            _pressure.setRadius(data.val);
            break;
        case 'strength':
            _pressure.setStrength(data.val);
            break;
        case 'pressure':
            let res = _pressure.pressure(data.attr, data.point);
            self.postMessage(res);
            break;
    }
};
