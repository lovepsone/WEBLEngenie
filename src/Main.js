/*
* author lovepsone
*/

import {Terrain} from './Terrain.js';

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
		this.terrain = new Terrain();
	}

	CreateObject(_width, _height) {

		this.terrain.CreateTerrain(_width, _height, this.scene, this.camera);
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
