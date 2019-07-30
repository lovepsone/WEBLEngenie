/*
* author lovepsone
*/

import {Draw} from './DrawNoise.js';

let _worker = null;
let _width = 128, _height = 128;
let _noise = null;

class Biomes {

	constructor(width, height) {

        _noise = new Draw();
	}
}

function mapper(val, current_MIN, current_MAX) {

	return (val - current_MIN) / (current_MAX - current_MIN);
}

// biomeColor(biome(h, m));
function biome(height, moisture) {
	
	if (height < 0.1) return 'OCEAN';
	if (height < 0.12) return 'BEACH';
	
	if (height > 0.8) {

		if (moisture < 0.1) return 'SCORCHED';
		if (moisture < 0.2) return 'BARE';
		if (moisture < 0.5) return 'TUNDRA';

		return 'SNOW';
	}
	
	if (height > 0.6) {
		
		if (moisture < 0.33) return 'TEMPERATE_DESERT';
		if (moisture < 0.66) return 'SHRUBLAND';
		
		return 'TAIGA';
	}
	
	if (height > 0.3) {
		
		if (moisture < 0.16) return 'TEMPERATE_DESERT';
		if (moisture < 0.50) return 'GRASSLAND';
		if (moisture < 0.83) return 'TEMPERATE_DECIDUOUS_FOREST';
		
		return 'TEMPERATE_RAIN_FOREST';
	}
	
	if (moisture < 0.16) return 'SUBTROPICAL_DESERT';
	if (moisture < 0.33) return 'GRASSLAND';
	if (moisture < 0.66) return 'TROPICAL_SEASONAL_FOREST';
	
	return 'TROPICAL_RAIN_FOREST';
}

function biomeColor(type) {

	let buff = null;

	switch(type) {

		case 'OCEAN':
			buff = new THREE.Color(0x44447a);
			break;
		case 'BEACH':
			buff = new THREE.Color(0xa09077);
			break;
		case 'SCORCHED':
			buff = new THREE.Color(0x555555);
			break;
		case 'BARE':
			buff = new THREE.Color(0x888888);
			break;
		case 'TUNDRA':
			buff = new THREE.Color(0xbbbbaa);
			break;
		case 'SNOW':
			buff = new THREE.Color(0xdddde4);
			break;
		case 'TEMPERATE_DESERT':
			buff = new THREE.Color(0xc9d29b);
			break;
		case 'SHRUBLAND':
			buff = new THREE.Color(0x889977);
			break;
		case 'TAIGA':
			buff = new THREE.Color(0x99aa77);
			break;
		case 'GRASSLAND':
			buff = new THREE.Color(0x88aa55);
			break;
		case 'TEMPERATE_DECIDUOUS_FOREST':
			buff = new THREE.Color(0x679459);
			break;
		case 'TEMPERATE_RAIN_FOREST':
			buff = new THREE.Color(0x448855);
			break;
		case 'SUBTROPICAL_DESERT':
			buff = new THREE.Color(0xd2b98b);
			break;
		case 'TROPICAL_SEASONAL_FOREST':
			buff = new THREE.Color(0x559944);
			break;
		case 'TROPICAL_RAIN_FOREST':
			buff = new THREE.Color(0x337755);
			break;

	}

	return buff;
}

export {Biomes};