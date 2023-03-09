/*
* @author lovepsone 2019 - 2023
*/

let _bodys = [];

export class Character {

    constructor() {

    }

    step(AR, N) {

        if(!_bodys.length) return;

        _bodys.forEach(function(b, id)
		{
			const n = N + (id * 8);
            const s = AR[n] * 3.33;
            b.userData.speed = s * 100;
            b.position.fromArray(AR, n + 1);
            b.quaternion.fromArray(AR, n + 4);
		});
    }

    add(mesh, option) {

        _bodys.push(mesh);
    }

    get(id) {

        if(!_bodys.length) null;
        return _bodys[id];
    }
}