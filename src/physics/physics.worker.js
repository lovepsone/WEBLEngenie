/*
* author lovepsone
*/

'use strict';
const Module = {TOTAL_MEMORY: 256*1024*1024}, VERSION = 0.15;
self.importScripts('./ammo.wasm.js');

let configAmmo  =  {

    locateFile:()  =>  './ammo.wasm.wasm'
};

let ROOT = {

    Ar: null,
    ArPos: null,

    world: null,
    gravity: null,

    post: null,


    key: [0, 0, 0, 0, 0]
};

let _RigidBody, _Character;

Ammo(configAmmo).then(function(Ammo) {

    importScripts('./WorkerRigidBody.js');
    importScripts('./WorkerCharacter.js');

    let _solver, _collision, _dispatcher, _broadphase;

    console.log(`physics.worker: succesful load ammo.js. VERSION = ${VERSION}`);
    self.postMessage({msg: 'int'});

    class AmmoPhysics {

        init(option) {

            ROOT.gravity = option.gravity || [0, -10, 0];
            ROOT.ArLng = option.settings[0];
            ROOT.ArPos = option.settings[1];
            ROOT.ArMax = option.settings[2];
            ROOT.Ar = new Float32Array(new ArrayBuffer(ROOT.ArMax * Float32Array.BYTES_PER_ELEMENT));

            _collision = new Ammo.btDefaultCollisionConfiguration();
            _dispatcher = new Ammo.btCollisionDispatcher(_collision);
            _broadphase = new Ammo.btDbvtBroadphase();
            _solver = new Ammo.btSequentialImpulseConstraintSolver();

            ROOT.world = new Ammo.btDiscreteDynamicsWorld(_dispatcher, _broadphase, _solver, _collision);
            ROOT.world.setGravity(new Ammo.btVector3(ROOT.gravity[0], ROOT.gravity[1], ROOT.gravity[2]));
            ROOT.post = this.post;

            let dInfo = ROOT.world.getDispatchInfo();
            dInfo.set_m_allowedCcdPenetration(0.001);
            //self.postMessage({msg: 'start'});

            _RigidBody = new RigidBody(ROOT);
            _Character = new Character(ROOT);
        }

        post(msg) {

            self.postMessage(msg);
        }

        add(option) {

            if (option.type == 'character') _Character.add(option);
            else _RigidBody.add(option);
        }

        stepSimulation(option) {

            let delta = option.delta;
            let key = option.key == undefined ? null : option.key;
            option.angle = option.angle == undefined ? 0: option.angle;
            ROOT.world.stepSimulation(option.delta, 2, 1/60);

            if (key != null) {

                ROOT.key[0] = key[0];
                ROOT.key[1] = key[1];
                ROOT.key[2] = key[2];
                ROOT.key[3] = key[3];
                ROOT.key[4] = key[4];
            }

            _Character.control('', ROOT.key, option.angle);
            _Character.step(ROOT.Ar, ROOT.ArPos[0])
            _RigidBody.step(ROOT.Ar, ROOT.ArPos[2]);
            self.postMessage({msg: 'step', Ar: ROOT.Ar});
        }
    };

    let physics = new AmmoPhysics();

    self.onmessage = function(event) {

        switch(event.data.msg) {
    
            case 'int': physics.init(event.data.opt); break;
            case 'add': physics.add(event.data.opt); break;
            case 'step': physics.stepSimulation(event.data.opt); break;
        }
    }
});