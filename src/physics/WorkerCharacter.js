/*
* @author lovepsone 2019 - 2021
*/

function direction(p, q) { //position, quat

    let qx = q.x(), qy = q.y(), qz = q.z(), qw = q.w();
    let x = p.x(), y = p.y(), z = p.z();

	// calculate quat * vector
	let ix = qw * x + qy * z - qz * y;
	let iy = qw * y + qz * x - qx * z;
	let iz = qw * z + qx * y - qy * x;
	let iw = - qx * x - qy * y - qz * z;

	// calculate result * inverse quat
	let xx = ix * qw + iw * - qx + iy * - qz - iz * - qy;
	let yy = iy * qw + iw * - qy + iz * - qx - ix * - qz;
	let zz = iz * qw + iw * - qz + ix * - qy - iy * - qx;

	p.setValue(xx, yy, zz);
}

function setFromAxisAngle(quat, axis, angle) {

    let halfAngle = angle * 0.5;
    let s = Math.sin(halfAngle);
    quat.setValue(axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(halfAngle));
}

class Actor {

    constructor(name, option) {

        this.type = 'character';
        this.body = null;
        this.controller = null;
    
        this.angle = 0;
        this.speed = 0;
        this.wasJumping = false;
        this.verticalVelocity = 0;
        this.angleInc = 0.1;
    
        this.quat = new Ammo.btQuaternion(0, 0, 0, 1);
        this.position = new Ammo.btVector3();

        option.size = option.size == undefined ? [1, 1, 1] : option.size;
		option.position = option.position == undefined ? [0, 0, 0] : option.position;
        option.quat = option.quat == undefined ? [0, 0, 0, 1] : option.quat;

        this.body = new Ammo.btPairCachingGhostObject();
        const shape = new Ammo.btCapsuleShape(option.size[0], option.size[1] * 0.5);
        shape.setMargin(0.05);

        const transform = new Ammo.btTransform(); 
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(option.position[0], option.position[1], option.position[2]));
        transform.setRotation(new Ammo.btQuaternion(option.quat[0],  option.quat[1],  option.quat[2],  option.quat[3]));
        this.body.setWorldTransform(transform);
    
        this.body.setCollisionShape(shape);
        this.body.setCollisionFlags(16); //FLAGS.CHARACTER_OBJECT
        this.body.setFriction(option.friction || 0.1 );
        this.body.setRestitution(option.restitution || 0);
        this.body.setActivationState(4); // STATE.DISABLE_DEACTIVATION
        this.body.activate();

        this.controller = new Ammo.btKinematicCharacterController(this.body, shape, option.stepH || 0.35, option.upAxis || 1);
        option.gravity = 9.8 * 3;
        option.jumpSpeed = 20;
        option.maxJumpHeight = 200;
        this.applyOption(option);
        this.controller.setUseGhostSweepTest(shape);
        this.controller.setVelocityForTimeInterval(new Ammo.btVector3(0, 0, 0), 1);
        this.setAngle(0);
        Ammo.destroy(transform);
    }

    step(Ar, n) {

        Ar[n] = this.speed;
		Ar[n + 1] = this.body.getWorldTransform().getOrigin().x();
		Ar[n + 2] = this.body.getWorldTransform().getOrigin().y();
		Ar[n + 3] = this.body.getWorldTransform().getOrigin().z();
		Ar[n + 4] = this.body.getWorldTransform().getRotation().x();
		Ar[n + 5] = this.body.getWorldTransform().getRotation().y();
		Ar[n + 6] = this.body.getWorldTransform().getRotation().z();
        Ar[n + 7] = this.body.getWorldTransform().getRotation().w();
    }

    move(key, angle) {

        let walkSpeed = 0.13, angleInc = 0.1;
        let x = 0, y = 0, z = 0;

        if (key[4] == 1 && this.controller.canJump()) {

            this.controller.jump();
        }

        if (key[0]) {z = -walkSpeed;} else if (key[2]) {z = walkSpeed;}
        if (key[1]) {x = -walkSpeed;} else if (key[3]) {x = walkSpeed;}
        this.speed = z + x;
        let tangle = 0;
        tangle -= angle + 1.57;
        this.setAngle(tangle);

        if (this.body.getWorldTransform().getOrigin().y() < -150) {

            const transform = new Ammo.btTransform(); 
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(0, 150, 0));
            transform.setRotation(new Ammo.btQuaternion(0,  0,  0,  1));
            this.body.setWorldTransform(transform);
            Ammo.destroy(transform);
        } else {

            this.position.setValue(x, y /*+ this.verticalVelocity*/, z);
            direction(this.position, this.quat);
        }

        this.controller.setWalkDirection(this.position);
    }

    applyOption(option) {

		if (option.gravity !== undefined) this.controller.setGravity(option.gravity);
		if (option.upAxis !== undefined) this.controller.setUpAxis(option.upAxis);
		if (option.canJump !== undefined) this.controller.canJump(option.canJump);
		if (option.maxJumpHeight !== undefined) this.controller.setMaxJumpHeight(option.maxJumpHeight);
		if (option.jumpSpeed !== undefined) this.controller.setJumpSpeed(option.jumpSpeed);//0.1
		if (option.fallSpeed !== undefined) this.controller.setFallSpeed(option.fallSpeed);//55
		if (option.slopeRadians !== undefined) this.controller.setMaxSlope(option.slopeRadians);//45

		if(option.angle !== undefined) this.setAngle(option.angle);//45
		if(option.position !== undefined) {

            this.position.setValue(option.position[0], option.position[1], option.position[2]);
            direction(this.position, this.quat);
            this.controller.setWalkDirection(this.position);
		}
    }

    setAngle(angle) {

        let t = this.body.getWorldTransform();
        setFromAxisAngle(this.quat, [0, 1, 0], angle);
		t.setRotation(this.quat);
		this.angle = angle;
	}
}

class Character {

    constructor(root) {

        this.root = root;
        this.id = 0;
        this.actors = [];
    }

	step(AR, N) {

		this.actors.forEach(function(_actor, id) {

			const n = N + (id * 8);
            _actor.step(AR, n);
		});
    }

	control(name, key, angle) {

        this.actors[0].move(key, angle);
		//this.actors[0].setAngle( root.angle );
    }

	add(option) {

		let name = option.name !== undefined ? option.name : 'actor' + this.id ++;

		// delete old if same name
		// реализация ?

		let tmp = new Actor(name, option);
		this.root.world.addCollisionObject(tmp.body, option.group || 1, option.mask || - 1);
		this.root.world.addAction(tmp.controller);
        this.actors.push(tmp);
	}
}