/*
*
*/

class RigidBody {

    constructor(root) {

        this.root = root;
        this.bodys = [];
    }

    add(option) {

        let shape = null;

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

            case 'ThriMesh': {
                const mTriMesh = new Ammo.btTriangleMesh();
                const vx = option.v;
                for (let i = 0, fMax = vx.length; i < fMax; i += 9 ) {

                    const p1 = new Ammo.btVector3(vx[i + 0] * option.scale[0], vx[i + 1] * option.scale[1], vx[i + 2] * option.scale[2]);
                    const p2 = new Ammo.btVector3(vx[i + 3] * option.scale[0], vx[i + 4] * option.scale[1], vx[i + 5] * option.scale[2]);
                    const p3 = new Ammo.btVector3(vx[i + 6] * option.scale[0], vx[i + 7] * option.scale[1], vx[i + 8] * option.scale[2]);
                    mTriMesh.addTriangle(p1, p2, p3, true);
                    Ammo.destroy(p1);
                    Ammo.destroy(p2);
                    Ammo.destroy(p3);
                }
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
        if (option.mass !== 0 ) shape.calculateLocalInertia(option.mass, localInertia);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(option.position[0],  option.position[1],  option.position[2]));
        transform.setRotation(new Ammo.btQuaternion(option.quat[0],  option.quat[1],  option.quat[2],  option.quat[3]));
        
        const motionState = new Ammo.btDefaultMotionState(transform);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(option.mass, motionState, shape, localInertia);
        rbInfo.set_m_friction(option.friction || 0.5);
        rbInfo.set_m_restitution(option.restitution || 0.1);
        const body = new Ammo.btRigidBody(rbInfo);


        if (option.mass === 0) {

            body.setCollisionFlags(option.flag || 1); 
            this.root.world.addCollisionObject(body, option.group || 2, -1);

        } else {

            body.setCollisionFlags(option.flag || 0);
            body.setActivationState(option.state || 1);
            this.bodys.push(body);
            this.root.world.addRigidBody(body);
        }

        Ammo.destroy(rbInfo);
        Ammo.destroy(localInertia);
        this.root.post({msg: 'start'});
    }

    step(AR, N) {

        if(this.bodys.length === 0) return;

        this.bodys.forEach(function(b, id) {

            const n = N + (id * 8);
            const transform = new Ammo.btTransform();
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