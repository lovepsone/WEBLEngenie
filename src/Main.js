/*
* author lovepsone
*/

import {MoseRaycaster} from './MRaycaster.js';

class MainEngenie {

	constructor(c_fov, c_Width, c_Height) {
		this.renderer = new THREE.WebGLRenderer({antialias:true});
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.001, 9000);
		this.scene = new THREE.Scene();
		// renderer settings
		this.renderer.setClearColor(0x808080);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		
		this.camera.position.set(0, -6, 9);
		
		this.t = new MoseRaycaster(this.camera, this.scene.children);
		
		
		
		
		//PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
		var geometry = new THREE.PlaneBufferGeometry(5, 5, 10, 10);
		var material = new THREE.MeshBasicMaterial( {color: 0x0000ff, /*wireframe: true,*/ side: THREE.DoubleSide, morphTargets: true} );
		var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );

		this.mesh = new THREE.Mesh(geometry, material );
		var wireframe = new THREE.Mesh(geometry, wireframeMaterial);
		this.mesh.add( wireframe );
		this.scene.add(this.mesh);

		this.camera.lookAt(this.mesh.position);
	}

	Render() {

		this.renderer.render(this.scene, this.camera);
	}
	
	getRender() {
		return this.renderer;
	}
}

var AnimationFrame = function()
{
	requestAnimationFrame(AnimationFrame);
};

export {MainEngenie, AnimationFrame};
