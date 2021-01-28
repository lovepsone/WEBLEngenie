/*
* @author lovepsone 2019 - 2021
*/
import * as THREE from './../libs/three.module.js';

const _hemiLight = new THREE.HemisphereLight(0x191919, 0xc8c8c8), _DebugHemiLight = new THREE.HemisphereLightHelper(_hemiLight, 10, 0xffffbb);; //0x444444
const _dirLight = new THREE.DirectionalLight(0xffffe0), _DebugDirLight = new THREE.DirectionalLightHelper(_dirLight, 10, 0xffffe0);
const _invisible = new THREE.Object3D();
const _speed = 26, _radius = 100;
let _scene = null, _timer = {lastTimeMsec: 0, delta: 0, now: 0}, _angle = 0, _angleLight = 0;

class SunLight {

    constructor(scene, shadow = true) {

        _scene = scene;

        _hemiLight.position.set(0, _radius + 50, 0);
        _dirLight.castShadow = shadow;
        _dirLight.shadow.mapSize.width = 2048 * 2;
        _dirLight.shadow.mapSize.height = 2048 * 2;
        _scene.add(_dirLight, _hemiLight, _DebugHemiLight, _DebugDirLight, _invisible);
    }

	needUpdate(now) {

        if (now == undefined) return;
		_timer.lastTimeMsec = _timer.lastTimeMsec || now - 1000 / 60;
		const deltaMsec	= Math.min(200, now - _timer.lastTimeMsec);
		_timer.lastTimeMsec = now;
		_timer.delta = deltaMsec / 1000;
		_timer.now = now / 1000;
    
        _angle += _timer.delta / _speed * Math.PI * 2;
    
        _invisible.position.x = Math.sin(_angle) * _radius;
        _invisible.position.y = Math.cos(_angle) * _radius;

        const clockDeg = this.RadToDeg(Math.atan2(_invisible.position.x, _invisible.position.y) + Math.PI);
        const d = parseInt((this.RadToDeg(_angle) + 180) / 360); // days
		const h = clockDeg / 15; // hours
		const m = parseInt((h - parseInt(h)) * 60); //minutes

        const realDeg = parseInt(this.RadToDeg(_angle) + 180 - 360 * d);

        if (realDeg > 195 && realDeg < 255) {

            _angleLight += _timer.delta / (_speed * 2) * Math.PI * 2;

        } else if (realDeg > 285 && realDeg < 345) {

            _angleLight += _timer.delta / (_speed / 2) * Math.PI * 2;
        } else {

            _angleLight += _timer.delta / (_speed) * Math.PI * 2;
        }

        _dirLight.position.x = Math.sin(_angleLight) * _radius;
        _dirLight.position.y = Math.cos(_angleLight) * _radius;

        //console.log(`time ${parseInt(h)} : ${m} [${realDeg}`);

        _DebugHemiLight.update();
        _DebugDirLight.update();
    }

    DegToRad(deg) {

	    return (deg * Math.PI) / 180;
    }

    RadToDeg(rad) {

	    return (rad * 180) / Math.PI;
    }
};

export {SunLight};