/*
* @author lovepsone 2019 - 2023
*/

class RigidBody {

    constructor(root) {

        this.root = root;
        this.bodys = [];
    }

    add(option) {

        let shape = null, ammoHeightData = null;
        const bta = new Ammo.btVector3();
        const btb = new Ammo.btVector3();
        const btc = new Ammo.btVector3();
        //const va = new THREE.Vector3();
        //const vb = new THREE.Vector3();
        //const vc = new THREE.Vector3();

        option.mass = option.mass == undefined ? 0 : option.mass;
        option.size = option.size == undefined ? [1, 1, 1] : option.size;
        option.radius = option.radius == undefined ? [1, 1, 1] : option.radius;
        option.position = option.position == undefined ? [0, 0, 0] : option.position;
        option.quat = option.quat == undefined ? [0, 0, 0, 1] : option.quat;
        option.friction = option.friction == undefined ? 0.5 : option.friction;
        option.restitution = option.restitution == undefined ? 0 : option.restitution;
        option.scale =  option.scale == undefined ? [1, 1, 1] : option.scale;

        switch(option.type)
        {
            case 'Plane':
                shape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(0, 1, 0), 0);
                break;

            case 'Sphere':
                shape = new Ammo.btSphereShape(option.radius);
                shape.setMargin(0.05);
                break;

            case 'Box':
                shape =  new Ammo.btCylinderShape(new Ammo.btVector3(option.size[0] * 0.5, option.size[1] * 0.5, option.size[2] * 0.5));
                break;

            case 'Cylinder':
                shape = new Ammo.btCylinderShape(new Ammo.btVector3(option.radius, option.size[0] * 0.5, option.radius));
                break;

            case 'Cone':
                shape = new Ammo.btConeShape(option.radius, option.size[0]);
                break;
 
            case 'terrain':
				// This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
				const heightScale = 1;
				// Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
				const upAxis = 1;
				// hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
				const hdt = "PHY_FLOAT";
				// Set this to your needs (inverts the triangles)
                const flipQuadEdges = false;

                ammoHeightData = Ammo._malloc(4 * option.w * option.h);
                let p = 0, p2 = 0;
                
				for (let j = 0; j < option.h; j ++) {

					for (let i = 0; i < option.w; i ++) {

						// write 32-bit float data to memory
						Ammo.HEAPF32[ammoHeightData + p2 >> 2] = option.heightData[p];
						p ++;
						// 4 bytes/float
						p2 += 4;
					}
                }

                shape = new Ammo.btHeightfieldTerrainShape(option.w, option.h, ammoHeightData, heightScale, /*- */option.min, option.max, upAxis, hdt, flipQuadEdges);
				//shape.setLocalScaling(new Ammo.btVector3(1, 1, 1));
                shape.setMargin(0.05);
                break;

            case 'ThriMesh': {
                const mTriMesh = new Ammo.btTriangleMesh(true, false);
                //const components = option.v;

                if (option.index) {

                    for (let i = 0; i < option.index.count; i += 3) {

                        const ai = option.index.array[i] * 3;
                        const bi = option.index.array[i + 1] * 3;
                        const ci = option.index.array[i + 2] * 3;
                        //va.set(components[ai], components[ai + 1], components[ai + 2]);//.applyMatrix4(transform)
                        //vb.set(components[bi], components[bi + 1], components[bi + 2]);//.applyMatrix4(transform)
                        //vc.set(components[ci], components[ci + 1], components[ci + 2]);//.applyMatrix4(transform)
                        bta.setValue(option.v[ai], option.v[ai + 1], option.v[ai + 2]);
                        btb.setValue(option.v[bi], option.v[bi + 1], option.v[bi + 2]);
                        btc.setValue(option.v[ci], option.v[ci + 1], option.v[ci + 2]);
                        mTriMesh.addTriangle(bta, btb, btc, false);
                      }
                }
                /*const vx = option.v;
                for (let i = 0, fMax = vx.length; i < fMax; i += 9 ) {

                    p1.setValue(vx[i + 0] * option.scale[0], vx[i + 1] * option.scale[1], vx[i + 2] * option.scale[2]);
                    p2.setValue(vx[i + 3] * option.scale[0], vx[i + 4] * option.scale[1], vx[i + 5] * option.scale[2]);
                    p3.setValue(vx[i + 6] * option.scale[0], vx[i + 7] * option.scale[1], vx[i + 8] * option.scale[2]);
                    mTriMesh.addTriangle(p1, p2, p3, true);
                }*/

                if (option.mass === 0) {

                    // btScaledBvhTriangleMeshShape -- if scaled instances
                    shape = new Ammo.btBvhTriangleMeshShape(mTriMesh, true, true);
                } else {

                    shape = new Ammo.btConvexTriangleMeshShape(mTriMesh, true);
                }
                break;
            }
        }


        const localInertia = new Ammo.btVector3(0, 0, 0);
        if (option.mass > 0) shape.calculateLocalInertia(option.mass, localInertia);

        const transform = new Ammo.btTransform();
        transform.setIdentity();

        if (option.type != 'terrain') {

            transform.setOrigin(new Ammo.btVector3(option.position[0],  option.position[1],  option.position[2]));
        } else {

            transform.setOrigin(new Ammo.btVector3(0, (option.max + option.min) / 2, 0));
        }

        transform.setRotation(new Ammo.btQuaternion(option.quat[0],  option.quat[1],  option.quat[2],  option.quat[3]));
        
        const motionState = new Ammo.btDefaultMotionState(transform);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(option.mass, motionState, shape, localInertia);
        rbInfo.set_m_friction(option.friction || 0.5);
        rbInfo.set_m_restitution(option.restitution || 0.1);
        const body = new Ammo.btRigidBody(rbInfo);

        if (option.mass === 0) {

            body.setCollisionFlags(option.flag || 1);
            this.root.world.addCollisionObject(body, option.group || 2, -1);
            this.root.world.addRigidBody(body);

        } else {

            body.setCollisionFlags(option.flag || 0);
            body.setActivationState(option.state || 1); // 4?
            this.bodys.push(body);
            this.root.world.addRigidBody(body);
        }

        Ammo.destroy(rbInfo);
        Ammo.destroy(localInertia);
        Ammo.destroy(transform);
        Ammo.destroy(bta);
        Ammo.destroy(btb);
        Ammo.destroy(btc);
        //Ammo.destroy(p1);
        //Ammo.destroy(p2);
        //Ammo.destroy(p3);
        this.root.post({msg: 'start'});
    }

    step(AR, N) {

        if(this.bodys.length === 0) return;

        this.bodys.forEach(function(b, id) {

            const n = N + (id * 8);
            const transform = new Ammo.btTransform(); // нагрузка ?
            AR[n] = b.getLinearVelocity().length() * 9.8;//b.isActive() ? 1 : 0;

            if (AR[n] > 0) {
                
                b.getMotionState().getWorldTransform(transform);

                AR[n + 1] = transform.getOrigin().x();
                AR[n + 2] = transform.getOrigin().y();
                AR[n + 3] = transform.getOrigin().z();
                AR[n + 4] = transform.getRotation().x();
                AR[n + 5] = transform.getRotation().y();
                AR[n + 6] = transform.getRotation().z();
                AR[n + 7] = transform.getRotation().w();
                Ammo.destroy(transform);
            }
        });
    }
};