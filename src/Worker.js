/*
* author lovepsone
*/

import {NoisePerlin} from './worker/NoisePerlin.js';

let _NoisePerlin = new NoisePerlin(128, 128);

self.onmessage = function(event) {

    switch(event.data.cmd) {

        case 'BiomeStart':
            _NoisePerlin.setSize(event.data.size.width, event.data.size.height);
		    self.postMessage({'cmd': 'BiomeDraw', 'colors':  _NoisePerlin.Generate()});
            break;

        case 'BiomePixels':
			self.postMessage({'cmd': 'BiomeComplete', 'result': _NoisePerlin.RevertPixels(event.data.data)});
            break;
    }
}