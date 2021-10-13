/*
* @author lovepsone 2019 - 2021
* Part of the code from https://github.com/gkjohnson/three-mesh-bvh/blob/master/example/sculpt.js
*/

let _radius = 10.0/5.0, _intensity = 10.0/5.0,  _maxSteps = 10;// options
let _typeBrush = 0; //clay, normal, flatten
let _mesh = null, _camera = null; // object3d
let _mouseVector = new THREE.Vector2();
let bindMouseDown, bindMouseUp, bindMouseMove;
let _brushMesh = null;
let _brushActive = false;
let _lastMouse = new THREE.Vector2(), _mouseState = false, _lastMouseState = false;
let _lastCastPose = new THREE.Vector3();

import * as THREE from './../libs/three.module.js';
import {CONTAINED, INTERSECTED, NOT_INTERSECTED} from './../libs/BVH/index.js';

class PressureTerrain {

	constructor(_viewObject, _viewport, _scene) {

		_camera = _viewObject;
		this.element = document.getElementById(_viewport);
		bindMouseDown =  this.onDocumentMouseDown.bind(this);
		bindMouseUp = this.onDocumentMouseUp.bind(this);
		bindMouseMove = this.onDocumentMouseMove.bind(this);

		const brushSegments = [new THREE.Vector3(), new THREE.Vector3(0, 1, 0)];
		for (let i = 0; i < 50; i ++) {
	
			const nexti = i + 1;
			const x1 = Math.sin( 2 * Math.PI * i / 50);
			const y1 = Math.cos( 2 * Math.PI * i / 50);
			const x2 = Math.sin(2 * Math.PI * nexti / 50);
			const y2 = Math.cos(2 * Math.PI * nexti / 50);
			brushSegments.push(new THREE.Vector3(x1, 0, y1), new THREE.Vector3(x2, 0, y2));
		}

		//_brushMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 50, 50), new THREE.MeshStandardMaterial({color: 0xEC407A, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.5, premultipliedAlpha: true, emissive: 0xEC407A, emissiveIntensity: 0.5}));
		_brushMesh = new THREE.LineSegments();
		_brushMesh.geometry.setFromPoints(brushSegments);
		_brushMesh.material.color.set(0xEC407A);
		_brushMesh.name = "Brush";
		_brushMesh.visible = false;
		_scene.add(_brushMesh);
	}

	setTerrain(mesh) {

		_mesh = mesh;
	}

	onDocumentMouseDown(event) {

		_mouseVector.x = (event.layerX / window.innerWidth) * 2 - 1;
		_mouseVector.y = - (event.layerY / window.innerHeight) * 2 + 1;
		_brushActive = true;
		_mouseState = Boolean(event.buttons & 3);

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(_mouseVector, _camera);
		raycaster.firstHitOnly = true;
	}

	onDocumentMouseUp(event) {

		_mouseState = Boolean(event.buttons & 3);
		_brushActive = false;
	}

	onDocumentMouseMove(event) {

        if (!(_mesh instanceof THREE.Mesh)) {

            console.warn('PressureTerrain.js: Create geometry before overlaying pen.');
            return;
		}

		_mouseVector.x = (event.layerX / window.innerWidth ) * 2 - 1;
		_mouseVector.y = - (event.layerY / window.innerHeight ) * 2 + 1;
		_brushActive = true;
	}

	UpdateRadius(r) {

		_radius  =  r / 5.0;
	}

	UpdateIntensity(s) {

		_intensity = s / 5.0;
	}

	UpdateTypeBrush(t) {

		_typeBrush = t;
	}

	AddEvents() {

		this.element.addEventListener("mousedown", bindMouseDown, false);
		this.element.addEventListener("mouseup", bindMouseUp, false);
		this.element.addEventListener("mousemove", bindMouseMove, false);
		_brushMesh.visible = true;
	}
	
	DisposeEvents() {

		_brushActive = false;
		_brushMesh.visible = false;
		this.element.removeEventListener("mousedown", bindMouseDown, false);
		this.element.removeEventListener("mouseup", bindMouseUp, false);
		this.element.removeEventListener("mousemove", bindMouseMove, false);
	}

	performStroke(point, brushObject, brushOnly = false, accumulatedFields = {}) {

		const {
			accumulatedTriangles = new Set(),
			accumulatedIndices = new Set(),
			accumulatedTraversedNodeIndices = new Set()
		} = accumulatedFields;

		const inverseMatrix = new THREE.Matrix4();
		inverseMatrix.copy(_mesh.matrixWorld).invert();

		const sphere = new THREE.Sphere();
		sphere.center.copy(point).applyMatrix4(inverseMatrix);
		sphere.radius = _radius;

		// Collect the intersected vertices
		const indices = new Set(), tempVec = new THREE.Vector3(), normal = new THREE.Vector3();
		const indexAttr = _mesh.geometry.index;
		const posAttr = _mesh.geometry.attributes.position;
		const normalAttr = _mesh.geometry.attributes.normal;
		const triangles = new Set();
		const bvh = _mesh.geometry.boundsTree;

		bvh.shapecast({

			intersectsBounds: (box, isLeaf, score, depth, nodeIndex) => {

				accumulatedTraversedNodeIndices.add(nodeIndex);
				const intersects = sphere.intersectsBox(box), {min, max} = box;

				if (intersects) {
					for (let x = 0; x <= 1; x ++) {
						for (let y = 0; y <= 1; y ++) {
							for (let z = 0; z <= 1; z ++ ) {
	
								tempVec.set(x === 0 ? min.x : max.x, y === 0 ? min.y : max.y, z === 0 ? min.z : max.z);
								if (!sphere.containsPoint(tempVec)) return INTERSECTED;
							}
						}
					}
					return CONTAINED;
				}
				return intersects ? INTERSECTED : NOT_INTERSECTED;
			},

			intersectsTriangle: (tri, index, contained) => {

				const triIndex = index;
				triangles.add(triIndex);
				accumulatedTriangles.add(triIndex);
				const i3 = 3 * index, a = i3 + 0, b = i3 + 1, c = i3 + 2;
				const va = indexAttr.getX(a), vb = indexAttr.getX(b), vc = indexAttr.getX(c);

				if (contained) {

					indices.add(va);
					indices.add(vb);
					indices.add(vc);
					accumulatedIndices.add(va);
					accumulatedIndices.add(vb);
					accumulatedIndices.add(vc);

				} else {
	
					if (sphere.containsPoint(tri.a)) {

						indices.add(va);
						accumulatedIndices.add(va);
					}

					if (sphere.containsPoint(tri.b)) {

						indices.add(vb);
						accumulatedIndices.add(vb);
					}

					if (sphere.containsPoint(tri.c)) {

						indices.add(vc);
						accumulatedIndices.add(vc);
					}
				}
				return false;
			}
		});
	
		// Compute the average normal at this point
		const localPoint = new THREE.Vector3();
		localPoint.copy(point).applyMatrix4(inverseMatrix);

		const planePoint = new THREE.Vector3();
		let totalPoints = 0;
		indices.forEach(index => {

			tempVec.fromBufferAttribute(normalAttr, index);
			normal.add(tempVec);

			// compute the average point for cases where we need to flatten to the plane.
			if (!brushOnly) {

				totalPoints ++;
				tempVec.fromBufferAttribute(posAttr, index);
				planePoint.add(tempVec);
			}
		});
		normal.normalize();
		brushObject.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

		if (totalPoints) {

			planePoint.multiplyScalar(1 / totalPoints);
		}

		// Early out if we just want to adjust the brush
		if (brushOnly) {

			return;
		}

		// perform vertex adjustment
		const targetHeight = _intensity * 0.05;
		const plane = new THREE.Plane();
		plane.setFromNormalAndCoplanarPoint(normal, planePoint);

		indices.forEach(index => {

			tempVec.fromBufferAttribute(posAttr, index);
			// compute the offset intensity
			const dist = tempVec.distanceTo(localPoint);
			let intensity = 1.0 - (dist / _radius);

			if (_typeBrush == 0) {

				intensity = Math.pow(intensity, 3);
				const planeDist = plane.distanceToPoint(tempVec);
				const clampedIntensity = Math.min(intensity * 4, 1.0);
				tempVec.addScaledVector(normal, clampedIntensity * targetHeight - planeDist * clampedIntensity * 0.3);
	
			} else if (_typeBrush == 1) {

				intensity = Math.pow(intensity, 2);
				tempVec.addScaledVector(normal, intensity * targetHeight);

			} else if (_typeBrush == 2) {

				intensity = Math.pow(intensity, 2);
				const planeDist = plane.distanceToPoint(tempVec);
				tempVec.addScaledVector(normal, - planeDist * intensity * _intensity * 0.01 * 0.5);
			}

			posAttr.setXYZ(index, tempVec.x, tempVec.y, tempVec.z);
			normalAttr.setXYZ(index, 0, 0, 0);
		});

		if (indices.size) posAttr.needsUpdate = true;
	}

	updateNormals( triangles, indices ) {

		const tempVec = new THREE.Vector3();
		const tempVec2 = new THREE.Vector3();
		const indexAttr = _mesh.geometry.index;
		const posAttr =  _mesh.geometry.attributes.position;
		const normalAttr =  _mesh.geometry.attributes.normal;

		// accumulate the normals in place in the normal buffer
		const triangle = new THREE.Triangle();
		triangles.forEach(tri => {

			const tri3 = tri * 3;
			const i0 = tri3 + 0;
			const i1 = tri3 + 1;
			const i2 = tri3 + 2;
			const v0 = indexAttr.getX(i0 );
			const v1 = indexAttr.getX(i1 );
			const v2 = indexAttr.getX(i2);
			triangle.a.fromBufferAttribute(posAttr, v0 );
			triangle.b.fromBufferAttribute(posAttr, v1 );
			triangle.c.fromBufferAttribute(posAttr, v2 );
			triangle.getNormal(tempVec2 );

			if (indices.has(v0)) {

				tempVec.fromBufferAttribute(normalAttr, v0);
				tempVec.add(tempVec2 );
				normalAttr.setXYZ(v0, tempVec.x, tempVec.y, tempVec.z);
			}

			if (indices.has(v1)) {

				tempVec.fromBufferAttribute(normalAttr, v1);
				tempVec.add(tempVec2);
				normalAttr.setXYZ(v1, tempVec.x, tempVec.y, tempVec.z);
			}

			if (indices.has(v2)) {

				tempVec.fromBufferAttribute(normalAttr, v2);
				tempVec.add(tempVec2);
				normalAttr.setXYZ(v2, tempVec.x, tempVec.y, tempVec.z);
			}
		});

		// normalize the accumulated normals
		indices.forEach( index => {

			tempVec.fromBufferAttribute(normalAttr, index);
			tempVec.normalize();
			normalAttr.setXYZ(index, tempVec.x, tempVec.y, tempVec.z);
		});

		normalAttr.needsUpdate = true;
	}

	needUpdate() {

		_brushMesh.visible = false;
		if (_brushActive) {

			const raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(_mouseVector, _camera);
			raycaster.firstHitOnly = true;
	
			const hit = raycaster.intersectObject(_mesh, true)[0];

			if (hit) {

				_brushMesh.visible = true;
				_brushMesh.scale.set(_radius, _radius, _radius);
				_brushMesh.position.copy(hit.point);

				// if the last cast pose was missed in the last frame then set it to the current point so we don't streak across the surface
				if (_lastCastPose.x === Infinity) _lastCastPose.copy(hit.point);

				// If the mouse isn't pressed don't perform the stroke
				if (!(_mouseState || _lastMouseState)) {

					this.performStroke(hit.point, _brushMesh, true);
					_lastMouse.copy(_mouseVector);
					_lastCastPose.copy(hit.point);
	
				} else {

					// compute the distance the mouse moved and that the cast point moved
					const mdx = (_mouseVector.x - _lastMouse.x ) * window.innerWidth * window.devicePixelRatio;
					const mdy = (_mouseVector.y - _lastMouse.y ) * window.innerHeight * window.devicePixelRatio;
					let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
					let castDist = hit.point.distanceTo(_lastCastPose );

					const step = _radius * 0.15;
					const percent = Math.max(step / castDist, 1 / _maxSteps);
					const mstep = mdist * percent;
					let stepCount = 0;

					// perform multiple iterations toward the current mouse pose for a consistent stroke
					// TODO: recast here so he cursor is on the surface of the model which requires faster
					// refitting of the model
					const changedTriangles = new Set();
					const changedIndices = new Set();
					const traversedNodeIndices = new Set();
					const sets = {
						accumulatedTriangles: changedTriangles,
						accumulatedIndices: changedIndices,
						accumulatedTraversedNodeIndices: traversedNodeIndices
					};

					while (castDist > step && mdist > 10 * 200 / hit.distance) {

						_lastMouse.lerp(_mouseVector, percent);
						_lastCastPose.lerp(hit.point, percent);
						castDist -= step;
						mdist -= mstep;

						this.performStroke(_lastCastPose, _brushMesh, false, sets);

						stepCount ++;
						if (stepCount > _maxSteps) break;
					}

					// refit the bounds and update the normals if we adjusted the mesh
					if (stepCount > 0) {

						// refit bounds and normal updates could happen after every stroke
						// so it's up to date for the next one because both of those are used when updating
						// the model but it's faster to do them here.
						this.updateNormals(changedTriangles, changedIndices);
						_mesh.geometry.boundsTree.refit(traversedNodeIndices);
					} else {

						this.performStroke(hit.point, _brushMesh, true);
					}
				}
			} 
		}
	}
}

export {PressureTerrain};