/*
* @author lovepsone 2019 - 2023
*/

import {DrawNoise} from './DrawNoise.js';

let _worker = null;
let _width = 128, _height = 128;
let _scope = null;
let TypePixelsRevert = 0;

let _moisture = [];

let colors =  {
    OCEAN:                      0x44447a, // вода
    BEACH:                      0xa09077, // пляж
    SCORCHED:                   0x555555, // выжженный(камни)
    BARE:                       0x888888, // пустыня
    TUNDRA:                     0xbbbbaa, // тундра (почти нет растительности)
    SNOW:                       0xdddde4, // снег
    TEMPERATE_DESERT:           0xc9d29b, // пустыня (засуха)
    TAIGA:                      0x99aa77, // густой лес
	GRASSLAND :                 0x88aa55, // трава
	TEMPERATE_DECIDUOUS_FOREST: 0x679459, // лиственный лес
	TEMPERATE_RAIN_FOREST:      0x448855, // лес с частыми дождями
	SUBTROPICAL_DESERT:         0xd2b98b, // субтрапическая пустыня
	TROPICAL_SEASONAL_FOREST:   0x559944, // тропический сезонный лес
	TROPICAL_RAIN_FOREST:       0x337755  // ТРОПИЧЕСКИЙ ЛЕС
};

class Biomes extends DrawNoise {

	constructor() {

        super(128, 128, 'CanvasGenNoise');
        _scope = this;
    }

    get(height, val) {
        
        let moisture = _moisture[val];

        if (height < 0.1) return colors.OCEAN;
        if (height < 0.2) return colors.BEACH;
        
        if (height > 0.8) {
            
            if (moisture < 0.2) return colors.SCORCHED;
            if (moisture < 0.4) return colors.BARE;
            if (moisture < 0.6) return colors.TUNDRA;
            
            return colors.SNOW;
        }
        
        if (height > 0.6) {
            
            if (moisture < 0.33) return colors.TEMPERATE_DESERT;
            if (moisture < 0.66) return colors.GRASSLAND;
            
            return colors.TAIGA;
        }
        
        if (height > 0.4) {
            
            if (moisture < 0.2) return colors.TEMPERATE_DESERT;
            if (moisture < 0.4) return colors.GRASSLAND;
            if (moisture < 0.6) return colors.TEMPERATE_DECIDUOUS_FOREST;
            
            return colors.TEMPERATE_RAIN_FOREST;
        }
        
        if (moisture < 0.2) return colors.SUBTROPICAL_DESERT;
        if (moisture < 0.4) return colors.GRASSLAND;
        if (moisture < 0.6) return colors.TROPICAL_SEASONAL_FOREST;
        
        return colors.TROPICAL_RAIN_FOREST;
    }

    Draw(colors) {

        for (let i = 0; i < colors.length; i++) {

            for (let j = 0; j < colors[i].length; j++) {

                _scope.setMatrix(i, j, colors[i][j]);
            }
        }

        return _scope.getContext().getImageData(0, 0, _scope.getSize().width, _scope.getSize().height);
    }

    setMoisture(val) {

        _moisture = val;
    }

    setTypePixels(val = 0) {

        TypePixelsRevert = val;
    }
};

function mapper(val, current_MIN, current_MAX) {

	return (val - current_MIN) / (current_MAX - current_MIN);
}

export {Biomes};