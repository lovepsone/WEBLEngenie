/*
* @author lovepsone 2019 - 2021
*/

import {NoisePerlin} from './worker/NoisePerlin.js';
import {CalculateRoad} from './worker/CalculateRoad.js';
import {NoiseDiamondSquare} from './worker/NoiseDiamondSquare.js';

let _NoiseDiamondSquare = new NoiseDiamondSquare(128);
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
            _CalculateRoad.clearData();
            tmp = _CalculateRoad.BuildTop(event.data.points, event.data.ExtrudePoints, event.data.Size);
            self.postMessage({'cmd':'RoadComplete', 'dataRoad': tmp, 'wireframe': event.data.Wireframe});
            tmp = null;
            break;

        case 'HeightMapPerlin':
            _NoisePerlin.setSize(event.data.size, event.data.size);
            self.postMessage({'cmd': 'HeightMapPerlinGenerate', 'colors':  _NoisePerlin.Generate()});
            break;

        case 'HeightMapDiamondSquare':
            _NoiseDiamondSquare.setSize(event.data.size);
            self.postMessage({'cmd': 'HeightMapDiamondSquareGenerate', 'colors':  _NoiseDiamondSquare.Generate()});
            break;
    }
}