/*
* Author lovepsone
*/

import * as THREE from './../libs/three/Three.js';

function MatchPositionBlocks(size, values) {

    let _x = 0, _z = 0;
    let _blocks = [];

    for (let i = 0; i < size; i++) {

        if ((i % Math.sqrt(size)) == 0 && i != 0) {
    
            _z++;
            _x = 0;
        }
    
        _blocks.push(new THREE.Vector3(values[_x], 0, values[_z]));
        _x++;
    }

    return _blocks;
}

export const SIZE_BLOCK_TILE = 32; // 32X32
export const COMMON_POINTS_BLOCK_TOP = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    30, 31
];
export const COMMON_POINTS_BLOCK_RIGHT = [
    31, 63, 95, 127, 159, 191, 223, 255, 287, 319,
    351, 383, 415, 447, 479, 511, 543, 575, 607, 639,
    671, 703, 735, 767, 799, 831, 863, 895, 927, 959,
    991, 1023
];
export const COMMON_POINTS_BLOCK_BOTTOM = [
    992, 993, 994, 995, 996, 997, 998, 999, 1000, 1001,
    1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011,
    1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021,
    1022, 1023
];
export const COMMON_POINTS_BLOCK_LEFT = [
    0, 32, 64, 96, 128, 160, 192, 224, 256, 288,
    320, 352, 384, 416, 448, 480, 512, 544, 576, 608,
    640, 672, 704, 736, 768, 800, 832, 864, 896, 928,
    960, 992
];

export const COMMON_POINTS_BLOCK = COMMON_POINTS_BLOCK_TOP.concat(COMMON_POINTS_BLOCK_RIGHT, COMMON_POINTS_BLOCK_BOTTOM, COMMON_POINTS_BLOCK_LEFT);

/*
* size tile 32x32 count vertex(x, y, z) = 1024
*
* size geometry = 128*128; tiles = 16
* size geometry = 256*256; tiles = 64
* size geometry = 512*512; tiles = 256
*/
const SIZE_64x64 = 4;
const SIZE_128x128 = 16;
const SIZE_256x256 = 64;
const SIZE_512x512 = 256;
const values_64x64 = [-16, 16];
const values_128x128 = [-48, -16, 16, 48];
const values_256x256 = [-112, -80, -48, -16, 16, 48, 80, 112];
const values_512x512 = [-240, -208, -176, -144, -112, -80, -48, -16, 16, 48, 80, 112, 144, 176, 208, 240];

let p = [];
p[64] = MatchPositionBlocks(SIZE_64x64, values_64x64);
p[128] = MatchPositionBlocks(SIZE_128x128, values_128x128),
p[256] = MatchPositionBlocks(SIZE_256x256, values_256x256),
p[512] = MatchPositionBlocks(SIZE_512x512, values_512x512)
export const POSITIONS = p;