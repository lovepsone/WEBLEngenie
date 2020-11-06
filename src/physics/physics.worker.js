/*
* author lovepsone
*/
const Module = {TOTAL_MEMORY: 256*1024*1024}, VERSION = 0.03;

importScripts('./ammo.wasm.js');

configAmmo  =  {

    locateFile:()  =>  './ammo.wasm.wasm'
};

function initARRAY(max) {

    let tmp = new ArrayBuffer(max * Float32Array.BYTES_PER_ELEMENT);
    return new Float32Array(tmp);
}

Ammo(configAmmo).then(function(Ammo) {

    let _arr = {ArLng: null, ArPos: null, ArMax: null, Ar: null};
    let _configWorld = {solver: null, collision: null, dispatcher: null, broadphase: null, world: null};
    let _bodyes = {Rigids: [], Character: []};
    let timeStep;

    console.log(`physics.worker: succesful load ammo.js. VERSION = ${VERSION}`);
    self.postMessage({msg: 'int'});

    let AmmoPhysics = {

        init: function(option) {

            //if(option.timeStep !== undefined) timeStep = option.timeStep;

            option.gravity = option.gravity || [0, -10, 0];
            _arr.ArLng = option.settings[0];
            _arr.ArPos = option.settings[1];
            _arr.ArMax = option.settings[2];
            _arr.Ar = initARRAY(_arr.ArMax);

            _configWorld.collision = new Ammo.btDefaultCollisionConfiguration();
            _configWorld.dispatcher = new Ammo.btCollisionDispatcher(_configWorld.collision);
            _configWorld.broadphase = new Ammo.btDbvtBroadphase();
            _configWorld.solver = new Ammo.btSequentialImpulseConstraintSolver();

            _configWorld.world = new Ammo.btDiscreteDynamicsWorld(
                _configWorld.dispatcher,
                _configWorld.broadphase,
                _configWorld.solver,
                _configWorld.collision
            );
            _configWorld.world.setGravity(new Ammo.btVector3(option.gravity[0], option.gravity[1], option.gravity[2]));

            let dInfo = _configWorld.world.getDispatchInfo();
            dInfo.set_m_allowedCcdPenetration(0.001);
            //self.postMessage({msg: 'start'});
        },

        addRigidBody: function(option) {

            let shape = null;
            let _vec3 = new Ammo.btVector3();

            option.mass = option.mass == undefined ? 0 : option.mass;
            option.size = option.size == undefined ? [1, 1, 1] : option.size;
            option.position = option.position == undefined ? [0, 0, 0] : option.position;
            option.quat = option.quat == undefined ? [0, 0, 0, 1] : option.quat;
            option.friction = option.friction == undefined ? 0.5 : option.friction;
            option.restitution = option.restitution == undefined ? 0 : option.restitution;
        
            switch(option.type)
            {
                case 'Plane':
                    _vec3.setValue(0, 1, 0);
                    shape = new Ammo.btStaticPlaneShape(_vec3, 0);
                    break;
    
                case 'Sphere':
                    shape = new Ammo.btSphereShape(option.radius);
                    shape.setMargin(0.05);
                    break;
    
                case 'box':
    
                    break;
                case 'mesh':
                    break;
                case 'convex':
                    break;
            }
    
    
            const localInertia = new Ammo.btVector3(0, 0, 0);
            if (option.mass !== 0 ) shape.calculateLocalInertia(option.mass, localInertia);
    
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(option.position[0],  option.position[1],  option.position[2]));
            transform.setRotation(new Ammo.btQuaternion(option.quat[0],  option.quat[1],  option.quat[2],  option.quat[3]));
            
            const motionState = new Ammo.btDefaultMotionState(transform);
    
            let rbInfo = new Ammo.btRigidBodyConstructionInfo(option.mass, motionState, shape, localInertia);
            rbInfo.set_m_friction(option.friction || 0.5);
            rbInfo.set_m_restitution(option.restitution || 0.1);
            let body = new Ammo.btRigidBody(rbInfo);
    
            //_configWorld.world.addRigidBody(body); //don't add static objects?

            if (option.mass === 0) {

                body.setCollisionFlags(option.flag || 1); 
                _configWorld.world.addCollisionObject(body, option.group || 2, /*mask?*/-1);

            } else {
    
                body.setCollisionFlags(option.flag || 0);
                body.setActivationState(option.state || 1);
                _bodyes.Rigids.push(body);
                _configWorld.world.addRigidBody(body);
            }
    
            Ammo.destroy(rbInfo);
            self.postMessage({msg: 'start'});
            //console.log('physics.worker: add RigidBody ' + option.type);
        },

        stepRigidBody: function(AR, N) {

            if(_bodyes.length === 0) return;

            _bodyes.Rigids.forEach(function(b, id) {
    
                const n = N + (id * 8);
                const transform = new Ammo.btTransform();
                AR[n] = b.getLinearVelocity().length() * 9.8;//b.isActive() ? 1 : 0;

                if (AR[n] > 0) {
                    
                    b.getMotionState().getWorldTransform(transform);
                    //let origin = _transformW.getOrigin();
                    AR[n + 1] = transform.getOrigin().x();
                    AR[n + 2] = transform.getOrigin().y();
                    AR[n + 3] = transform.getOrigin().z();
                    AR[n + 4] = transform.getRotation().x();
                    AR[n + 4] = transform.getRotation().y();
                    AR[n + 4] = transform.getRotation().z();
                    AR[n + 4] = transform.getRotation().w();
                    Ammo.destroy(transform);
                }
            });
        },
    
        stepSimulation: function(option) {
    
            let delta = option.delta;
            _configWorld.world.stepSimulation(option.delta, 2);
            
            //if (data.key != null) {
            //key = data.key;
            //}
            //ControlCharacter(0, data.angle);
            //stepCharacter(Ar, ArPos[0]);
            this.stepRigidBody(_arr.Ar, _arr.ArPos[2]);
            self.postMessage({msg: 'step', Ar: _arr.Ar});
        }
    };

    self.onmessage = function(event) {

        switch(event.data.msg) {
    
            case 'int': AmmoPhysics.init(event.data.opt); break;
            case 'add': AmmoPhysics.addRigidBody(event.data.opt); break;
            case 'step': AmmoPhysics.stepSimulation(event.data.opt); break;
        }
    }
});