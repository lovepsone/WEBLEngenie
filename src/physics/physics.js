/*
* author lovepsone
*/

import * as THREE from './../../libs/three/Three.js';
import {RigidBody} from './RigidBody.js';
import {Character} from './Character.js'
import {STATE, FLAG, GROUP, GeometryInfo} from './flags.js';

function Capsule( radius, height, radialSegs, heightSegs ) {

	THREE.BufferGeometry.call( this );

	this.type = 'Capsule';

    radius = radius || 1;
    height = height || 1;

    var pi = Math.PI;

    radialSegs = Math.floor( radialSegs ) || 12;
    var sHeight = Math.floor( radialSegs * 0.5 );

    heightSegs = Math.floor( heightSegs ) || 1;
    var o0 = Math.PI * 2;
    var o1 = Math.PI * 0.5;
    var g = new THREE.Geometry();
    var m0 = new THREE.CylinderGeometry( radius, radius, height, radialSegs, heightSegs, true );

    var mr = new THREE.Matrix4();
    var m1 = new THREE.SphereGeometry( radius, radialSegs, sHeight, 0, o0, 0, o1);
    var m2 = new THREE.SphereGeometry( radius, radialSegs, sHeight, 0, o0, o1, o1);
    var mtx0 = new THREE.Matrix4().makeTranslation( 0,0,0 );
   // if(radialSegs===6) mtx0.makeRotationY( 30 * THREE.Math.DEG2RAD );
    var mtx1 = new THREE.Matrix4().makeTranslation(0, height*0.5,0);
    var mtx2 = new THREE.Matrix4().makeTranslation(0, -height*0.5,0);
    mr.makeRotationZ( pi );
    g.merge( m0, mtx0.multiply(mr) );
    g.merge( m1, mtx1);
    g.merge( m2, mtx2);

    g.mergeVertices();
    g.computeVertexNormals();

    m0.dispose();
    m1.dispose();
    m2.dispose();

    this.fromGeometry( g );

    g.dispose();
}
Capsule.prototype = Object.create(THREE.BufferGeometry.prototype);


const clock = new THREE.Clock();
let _worker = null, _scope = null;

let _option = {

    worldscale: 1,
    gravity: [0, -10, 0],
    fps: 60,

    substep: 2,
    broadphase: 2,
    isNeedUpdate: false,

    controller: null,
    camera: null,
};

let _Ar;
let _ArLng = [10 * 8, 14 * 56, 1000 * 8, 8192 * 3, 100 * 4];
let _ArPos = [0, _ArLng[0], _ArLng[0] + _ArLng[1], _ArLng[0] + _ArLng[1] + _ArLng[2], _ArLng[0] + _ArLng[1] + _ArLng[2] + _ArLng[3]];
let _ArMax = _ArLng[0] + _ArLng[1] + _ArLng[2] + _ArLng[3] + _ArLng[4];
let _time = 0, _timestep = 1/60, _timerate = _timestep * 1000,  _temp = 0, _delta = 0, _count = 0, _then = 0, _timer;

let isLoadAmmo = false, tmpSMG = [];
let _RigidBody = null, _Character = null;


export class Physics {

    constructor() {

        _scope = this;
        _worker = new Worker('./src/physics/physics.worker.js'/*, {type: 'module'}*/);
        _worker.onmessage = this.OnMessage;
        _worker.postMessage = _worker.webkitPostMessage || _worker.postMessage;
        this.send('int', {gravity: _option.gravity, settings: [_ArLng, _ArPos, _ArMax]});
        _Character = new Character();
        _RigidBody = new RigidBody();
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

			if (_option.controller != null && _option.controller.getEnabled()) {

                _worker.postMessage({msg: 'step', opt: {delta: _delta, key: _option.controller.getKey(), angle: _option.controller.getAngleLongitude()}});
            } else {

                _worker.postMessage({msg: 'step', opt: {delta: _delta}});
            }
		}
    }

    start() {

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

    // option: mass, position, rotation, scale, type
    Mesh(geometry, material, option) {

        let mesh, isMesh = false, type = null;

        option = option || {};
        option.mass = option.mass || 0;
        option.position = option.position || [0, 0, 0];
        option.quat = option.quat || [0, 0, 0, 1];
        option.scale = option.scale || [1, 1, 1];

        if (geometry.type == 'Mesh') {

            isMesh = true;
            type = geometry.geometry.type;
        } else type = geometry.type;

        switch(type) {

            case "PlaneBufferGeometry":
                geometry.rotateX(-Math.PI / 2);
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.fromArray(option.position);
                mesh.quaternion.fromArray(option.quat);
                //mesh.scale.fromArray(option.scale);
                option.type = 'Plane';
                this.send('add', option);
                break;

            case "SphereBufferGeometry":
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.fromArray(option.position);
                mesh.quaternion.fromArray(option.quat);
                mesh.scale.fromArray(option.scale);
                option.type = 'Sphere';
                option.radius = geometry.parameters.radius;
                this.send('add', option);
                break;

            case "BoxBufferGeometry":
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.fromArray(option.position);
                mesh.quaternion.fromArray(option.quat);
                mesh.scale.fromArray(option.scale);
                option.type = 'Box';
                option.size = [geometry.parameters.width, geometry.parameters.height, geometry.parameters.depth];
                this.send('add', option);
                break;

            case "CylinderBufferGeometry":
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.fromArray(option.position);
                mesh.quaternion.fromArray(option.quat);
                mesh.scale.fromArray(option.scale);
                option.type = 'Cylinder';
                option.size = [geometry.parameters.height];
                option.radius = geometry.parameters.radiusTop;
                this.send('add', option);
                break;

            case "ConeBufferGeometry":
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.fromArray(option.position);
                mesh.quaternion.fromArray(option.quat);
                mesh.scale.fromArray(option.scale);
                option.type = 'Cone';
                option.size = [geometry.parameters.height];
                option.radius = geometry.parameters.radius;
                this.send('add', option);
                break;

            case "BufferGeometry":
                if (isMesh) {

                    mesh = geometry;
                    geometry.position.fromArray(option.position);
                    geometry.quaternion.fromArray(option.quat);
                    geometry.scale.fromArray(option.scale);
                    option.type = 'ThriMesh';
                    option.v = GeometryInfo(geometry.geometry);
                }
                this.send('add', option);
                break;
        }

        if (option.mass) _RigidBody.add(mesh, option);

        return mesh;
    }

    addCharacter(option, controller = null) {

        if (controller == null) {

            console.error('Physics.js: controller not defined!!!');
            return;
        }

        _option.controller = controller;
        option.size = option.size == undefined ? [0.25, 2, 6] : option.size;
        option.type = 'character';
        option.position = option.position || _option.controller.getPosition();
        //option.quaternion

        let mesh = new THREE.Mesh(new Capsule(2, 10, 6), new THREE.MeshBasicMaterial({ color: 0x993399/*, wireframe: true*/}));
        mesh.position.fromArray(option.position);
        _Character.add(mesh, option);
        this.send('add', option);
        return mesh;
    }

    needUpdate(id = 0) {

        if (_option.isNeedUpdate) {

            if (_option.controller != null) {

                _option.controller.setPosition(_Character.get(id).position.toArray());
                _Character.step(_Ar, _ArPos[0]);
            }
            _RigidBody.step(_Ar, _ArPos[2]);
        }
    }
}