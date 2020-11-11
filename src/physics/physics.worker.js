/*
* author lovepsone
*/
const Module = {TOTAL_MEMORY: 256*1024*1024}, VERSION = 0.11;

importScripts('./ammo.wasm.js');

configAmmo  =  {

    locateFile:()  =>  './ammo.wasm.wasm'
};

let ROOT = {

    Ar: null,
    ArPos: null,

    world: null,
    gravity: null,

    post: null,
};

let _RigidBody;

Ammo(configAmmo).then(function(Ammo) {

    importScripts('./WorkerRigidBody.js');

    let _solver, _collision, _dispatcher, _broadphase;
    let _bodyes = {Rigids: [], Character: []}, _controller = null;
    let timeStep;
    let _walkSpeed = 0.3, _angleInc = 0.1;

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
        }

        post(msg) {

            self.postMessage(msg);
        }

        add(option) {

            _RigidBody.add(option);

        }
 

        /*
        *
        * Character
        *
        */
        addCharacter(option) {

            const ID = 0;
            option.size = option.size == undefined ? [1, 2] : option.size;
            option.position = option.position == undefined ? [0, 0, 0] : option.position;
            option.quat = option.quat == undefined ? [0, 0, 0, 1] : option.quat;

            const shape = new Ammo.btCapsuleShape(option.size[0], option.size[1] * 0.5);
            const body = new Ammo.btPairCachingGhostObject();
    
            const transform = new Ammo.btTransform(); 
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(option.position[0], option.position[1], option.position[2]));
            transform.setRotation(new Ammo.btQuaternion(option.quat[0],  option.quat[1],  option.quat[2],  option.quat[3]));

            body.setWorldTransform(transform);
            body.setCollisionShape(shape);
            body.setCollisionFlags(16); //FLAGS.CHARACTER_OBJECT
            body.setFriction(option.friction || 0.1 );
            body.setRestitution(option.restitution || 0);
            body.setActivationState(4); // STATE.DISABLE_DEACTIVATION
            body.activate();

            _controller = new Ammo.btKinematicCharacterController(body, shape, option.stepH || 0.35, option.upAxis || 1);
            _controller.setUseGhostSweepTest(shape);
            _controller.setVelocityForTimeInterval(new Ammo.btVector3(0, 0, 0), 1);
            _bodyes.Character.push(body);

            //options
            if (option.gravity !== undefined) _controller.setGravity(option.gravity);
            if (option.upAxis !== undefined) _controller.setUpAxis(option.upAxis);
            if (option.canJump !== undefined) _controller.canJump(option.canJump);
            if (option.maxJumpHeight !== undefined) _controller.setMaxJumpHeight(option.maxJumpHeight);//0.01
            if (option.jumpSpeed !== undefined) _controller.setJumpSpeed(option.jumpSpeed);//0.1
            if (option.fallSpeed !== undefined) _controller.setFallSpeed(option.fallSpeed);//55
            if (option.slopeRadians !== undefined) _controller.setMaxSlope(option.slopeRadians);//45
            if (option.angle !== undefined) this.setAngle(option.angle, ID);
        }
  
        setAngle(angle, id) {

        }

        ControlCharacter(id, t, key) {

        }

        stepCharacter(AR, N) {
        
            if(!_bodyes.Character.length) return;
        
            _bodyes.Character.forEach(function(b, id) {

                const n = N + (id * 8);
                
                AR[n] = b.speed;
        
                const transform = b.getGhostObject().getWorldTransform();
        
                AR[n + 1] = transform.getOrigin().x();
                AR[n + 2] = transform.getOrigin().y();
                AR[n + 3] = transform.getOrigin().z();
                AR[n + 4] = transform.getRotation().x();
                AR[n + 5] = transform.getRotation().y();
                AR[n + 6] = transform.getRotation().z();
                AR[n + 7] = transform.getRotation().w();
            });
        }

        stepSimulation(option) {
    
            let delta = option.delta;
            let key = option.key == undefined ? null : option.key;
            ROOT.world.stepSimulation(option.delta, 2);

            //this.ControlCharacter(0, option.angle, key);
            //this.stepCharacter(_arr.Ar, _arr.ArPos[0]);
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
            case 'character': physics.addCharacter(event.data.opt); break;
            case 'characterRotation': physics.setCharacterRotation(event.data.opt.id, event.data.angle); break;
        }
    }
});