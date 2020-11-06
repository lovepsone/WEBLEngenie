/*
* author lovepsone
*/

import * as THREE from '../../libs/three/Three.js';

let _bodys = [];

export class SoftBody {

    constructor() {

        _bodys = [];
    }
    
    step(AR, N) {

		if(!_bodys.length) return;

		_bodys.forEach(function(b, id)
		{
			const n = N + (id * 8);
            const s = AR[n];

			if (s > 0) {
				b.position.fromArray(AR, n + 1);
				b.quaternion.fromArray(AR, n + 4);
			}
		});
    }

    add(mesh, option) {

        _bodys.push(mesh);
    }
}