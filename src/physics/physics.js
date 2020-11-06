/*
* author lovepsone
*/

import * as THREE from './../../libs/three/Three.js';
import {SoftBody} from './SoftBody.js';

const clock = new THREE.Clock();
let _worker = null, _scope = null;

let _option = {

    worldscale: 1,
    gravity: [0, -10, 0],
    fps: 60,

    substep: 2,
    broadphase: 2,
    isNeedUpdate: false
};

let _Ar;
let _ArLng = [10 * 8, 14 * 56, 1000 * 8, 8192 * 3, 100 * 4];
let _ArPos = [0, _ArLng[0], _ArLng[0] + _ArLng[1], _ArLng[0] + _ArLng[1] + _ArLng[2], _ArLng[0] + _ArLng[1] + _ArLng[2] + _ArLng[3]];
let _ArMax = _ArLng[0] + _ArLng[1] + _ArLng[2] + _ArLng[3] + _ArLng[4];
let _time = 0, _timestep = 1/60, _timerate = _timestep * 1000,  _temp = 0, _delta = 0, _count = 0, _then = 0, _timer;

let isLoadAmmo = false, tmpSMG = [];
let _SoftBody = null;


export class Physics {

    constructor() {

        _scope = this;
        _worker = new Worker('./src/physics/physics.worker.js'/*, {type: 'module'}*/);
        _worker.onmessage = this.OnMessage;
        _worker.postMessage = _worker.webkitPostMessage || _worker.postMessage;
        this.send('int', {gravity: _option.gravity, settings: [_ArLng, _ArPos, _ArMax]});
        _SoftBody = new SoftBody();
    }

    OnMessage(event) {

        switch(event.data.msg) {

            case 'int':
                _scope.send('int', {gravity: _option.gravity, settings: [_ArLng, _ArPos, _ArMax]});
                isLoadAmmo = true;
                for (let i = 0; i < tmpSMG.length; i++) _scope.send(tmpSMG[i].msg, tmpSMG[i].opt);
                break;

            case 'start': _scope.start(); break;
            case 'step': _scope.step(event.data); break;
        }
    }

    send(msg, opt) {

        if (!isLoadAmmo && msg != 'int') {

            tmpSMG.push({msg: msg, opt: opt});
        }

        _worker.postMessage({msg: msg, opt: opt});
    }

	sendData(stamp) {

        _timer = requestAnimationFrame(_scope.sendData);
		_time = stamp === undefined ? Date.now : stamp;
        _delta = _time - _then;

        if (_delta > _timerate) {

			_then = _time - (_delta % _timerate);
			/*if (Control == null)
			{
				worker.postMessage({Message: 'step', key: null});
			}
			else
			{
				worker.postMessage({Message: 'step', key: Control.getKey(), angle: Control.GetTheta()});
            }*/

            _worker.postMessage({msg: 'step', opt: {delta: _delta}});
		}
    }

    start()
	{
		this.sendData();
		console.log('physics.js: start ammo step.');
    }

    step(option) {

		if ((_time - 1000) > _temp) {

			_temp = _time;
			_option.fps = _count;
			_count = 0;
        }
        _count++;

        _Ar = option.Ar;
        _option.isNeedUpdate = true;
    };

    // option: mass, position, rotation, type
    Mesh(geometry, material, option) {

        let mesh = null;

        option = option || {};
        option.mass = option.mass || 0;
        option.position = option.position || [0, 0, 0];

        switch(geometry.type) {

            case "PlaneBufferGeometry":
                mesh = new THREE.Mesh(geometry, material);
                option.type = 'Plane';
                this.send('add', option);
                break;

            case "SphereBufferGeometry":
                mesh = new THREE.Mesh(geometry, material);
                option.type = 'Sphere';
                option.radius = geometry.parameters.radius;
                this.send('add', option);
                break;
        }

        if (option.mass) _SoftBody.add(mesh, option);

        return mesh;
    }

    needUpdate() {

        if (_option.isNeedUpdate) {

            _SoftBody.step(_Ar, _ArPos[2]);
        }
    }
}