/*
* author lovepsone
*/

import {DrawNoise} from './DrawNoise.js';

let _worker = null;
let _width = 128, _height = 128;
let _scope = null;

let colors =  {
    OCEAN:                      0x44447a,
    BEACH:                      0xa09077,
    SCORCHED:                   0x555555,
    BARE:                       0x888888,
    TUNDRA:                     0xbbbbaa,
    SNOW:                       0xdddde4,
    TEMPERATE_DESERT:           0xc9d29b,
    SHRUBLAND:                  0x889977,
    TAIGA:                      0x99aa77,
	GRASSLAND :                 0x88aa55,
	TEMPERATE_DECIDUOUS_FOREST: 0x679459,
	TEMPERATE_RAIN_FOREST:      0x448855,
	SUBTROPICAL_DESERT:         0xd2b98b,
	TROPICAL_SEASONAL_FOREST:   0x559944,
	TROPICAL_RAIN_FOREST:       0x337755
};

class Biomes extends DrawNoise {

	constructor() {

        super( 128, 128, 'CanvasGenNoise');
        _scope = this;
        _worker = new Worker('./src/WorkerNoisePerlin.js');
        _worker.onmessage = this.WorkerOnMessage;
    }

    GenerateDataPixels() {

        _worker.postMessage({'cmd': 'start', 'size': this.getSize()});
    }

    get(height, moisture) {
        
        if (height < 0.1) return colors.OCEAN;
        if (height < 0.12) return colors.BEACH;
        
        if (height > 0.8) {
            
            if (moisture < 0.1) return colors.SCORCHED;
            if (moisture < 0.2) return colors.BARE;
            if (moisture < 0.5) return colors.TUNDRA;
            
            return SNOW;
        }
        
        if (height > 0.6) {
            
            if (moisture < 0.33) return colors.TEMPERATE_DESERT;
            if (moisture < 0.66) return colors.SHRUBLAND;
            
            return TAIGA;
        }
        
        if (height > 0.3) {
            
            if (moisture < 0.16) return colors.TEMPERATE_DESERT;
            if (moisture < 0.50) return colors.GRASSLAND;
            if (moisture < 0.83) return colors.TEMPERATE_DECIDUOUS_FOREST;
            
            return colors.TEMPERATE_RAIN_FOREST;
        }
        
        if (moisture < 0.16) return colors.SUBTROPICAL_DESERT;
        if (moisture < 0.33) return colors.GRASSLAND;
        if (moisture < 0.66) return colors.TROPICAL_SEASONAL_FOREST;
        
        return color.TROPICAL_RAIN_FOREST;
    }

    WorkerOnMessage(e) {

        let data = e.data;

        for (let i = 0; i < data.length; i++) {

            for (let j = 0; j < data[i].length; j++) {

                _scope.setMatrix(i, j, data[i][j]);
            }
        }
    }
};

function mapper(val, current_MIN, current_MAX) {

	return (val - current_MIN) / (current_MAX - current_MIN);
}

export {Biomes};