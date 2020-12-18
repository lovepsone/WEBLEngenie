/*
* author lovepsone
*/

import {NoisePerlin} from './worker/NoisePerlin.js';
import {CalculateRoad} from './worker/CalculateRoad.js';

let _NoisePerlin = new NoisePerlin(128, 128);
let _CalculateRoad = new CalculateRoad(5);

self.onmessage = function(event) {

    let tmp = null;

    switch(event.data.cmd) {

        case 'BiomeStart':
            _NoisePerlin.setSize(event.data.size.width, event.data.size.height);
		    self.postMessage({'cmd': 'BiomeDraw', 'colors':  _NoisePerlin.Generate()});
            break;

        case 'BiomePixels':
			self.postMessage({'cmd': 'BiomeComplete', 'result': _NoisePerlin.RevertPixels(event.data.data)});
            break;

        case 'RoadGenerate':
            tmp = _CalculateRoad.BuildTop(event.data.points, event.data.ExtrudePoints);
            self.postMessage({'cmd':'RoadComplete', 'dataRoad': tmp, 'wireframe': event.data.wireframe});
            _CalculateRoad.clearData();
            tmp = null;
            break;
    }
}