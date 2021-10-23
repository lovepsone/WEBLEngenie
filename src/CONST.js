/*
* @author lovepsone 2019 - 2021
*/

export const BASENAMETEXTURES =  {

    OCEAN:                      './texture/ocean_dirt_512', //0x44447a,
    BEACH:                      './texture/beach_512', //0xa09077,
    SCORCHED:                   './texture/scorched_512',//0x555555,
    BARE:                       './texture/bare_512',//0x888888,
    TUNDRA:                     './texture/tundra_512',//0xbbbbaa,
    SNOW:                       './texture/snow_512',//0xdddde4,
    TEMPERATE_DESERT:           './texture/temperate_desert_512',//0xc9d29b,
    TAIGA:                      './texture/taiga_512',//0x99aa77,
	GRASSLAND :                 './texture/grass_512',//0x88aa55,
	TEMPERATE_DECIDUOUS_FOREST: './texture/temperate_deciduous_forest_512',//0x679459,
	TEMPERATE_RAIN_FOREST:      './texture/temperate_rain_forest_512',//0x448855,
	SUBTROPICAL_DESERT:         './texture/subtropical_desert_512',//0xd2b98b,
	TROPICAL_SEASONAL_FOREST:   './texture/tropical_seasonal_forest_512',//0x559944,
    TROPICAL_RAIN_FOREST:       './texture/tropical_rain_forest_512', //0x337755
};

export const SKYSIZE = 512;

export const SKYTEXTURES = {

    clear_1: './texture/sky/sky_clear_1.png',
    clear_2: './texture/sky/sky_clear_2.png'
};
export const SKYDATATEXTURES = Object.entries(SKYTEXTURES);

export const MAXINTENSITY = 100;
export const MININTENSITY = -100;
export const MAXSIZEROAD = 25;
export const MINSIZEROAD = 5;
export const MAXSIZEBOARD = 16;
export const MINSIZEBOARD = 7;
export const MAXSIZEBRUSH = 100;
export const MINSIZEBRUSH = 1;
export const COLORBOARDROAD = 0xc9d29b;
export const STEPSROAD = 7;
export const MAXBOARDS = 8;
export const STEPSBOARDS = 3;
export const BASEDATATEXTURES = Object.entries(BASENAMETEXTURES);

export const CLASSTULLTIP = 'ToolTip';
export const TOOLTIPWIND = 'ToolTipW';