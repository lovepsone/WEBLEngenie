/*
* @author lovepsone 2019 - 2023
* https://developer.mozilla.org/ru/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
*/

import * as THREE from '../libs/three.module.js';

const TEX_SIZE = 1024, TEX_REPEAT_SIZE = 256;

let _RepeatCanvas = document.createElement('canvas'),
    _ReSizeCanvas = document.createElement('canvas'),
    _MixCanvasDiffuse = document.createElement('canvas'),
    _MixCanvasNormal = document.createElement('canvas'),
    _tmpCanvas = document.createElement('canvas');
let _diffuses, _colors, _normals;

export class PackingTexture {

    constructor() {

        _ReSizeCanvas.width = _ReSizeCanvas.height = TEX_REPEAT_SIZE;
        _RepeatCanvas.width = _RepeatCanvas.height = TEX_SIZE;
        this.clearCanvas();
    }

    clearCanvas() {

        _MixCanvasDiffuse.width = _MixCanvasDiffuse.height = TEX_SIZE;
        _MixCanvasDiffuse.getContext('2d', {willReadFrequently: true}).fillStyle = '#000000';
        _MixCanvasDiffuse.getContext('2d', {willReadFrequently: true}).fillRect(0, 0, TEX_SIZE, TEX_SIZE);
        _MixCanvasNormal.width = _MixCanvasNormal.height = TEX_SIZE;
        _MixCanvasNormal.getContext('2d', {willReadFrequently: true}).fillStyle = '#000000';
        _MixCanvasNormal.getContext('2d', {willReadFrequently: true}).fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    }

    /*
    * return img.data
    */
    RepeatTexture(img) {

        _ReSizeCanvas.width = _ReSizeCanvas.height = TEX_REPEAT_SIZE;
        _RepeatCanvas.width = _RepeatCanvas.height = TEX_SIZE;

        _ReSizeCanvas.getContext('2d', {willReadFrequently: true}).drawImage(img, 0, 0, TEX_REPEAT_SIZE, TEX_REPEAT_SIZE);
        _RepeatCanvas.getContext('2d', {willReadFrequently: true}).rect(0, 0,  _RepeatCanvas.width, _RepeatCanvas.height);
        _RepeatCanvas.getContext('2d', {willReadFrequently: true}).fillStyle = _RepeatCanvas.getContext('2d', {willReadFrequently: true}).createPattern(_ReSizeCanvas, "repeat");
        _RepeatCanvas.getContext('2d', {willReadFrequently: true}).fill();

        return _RepeatCanvas.getContext('2d', {willReadFrequently: true}).getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    }

    setTexture2DArray(canvasTextureArray2d, index, size) {

        _ReSizeCanvas.width = _ReSizeCanvas.height = TEX_SIZE;
        _tmpCanvas.width = _tmpCanvas.height = size;

        const buf = canvasTextureArray2d.getImageData(0, index * size - size, size, index * size);
        _tmpCanvas.getContext('2d', {willReadFrequently: true}).putImageData(buf, 0, 0);
        _ReSizeCanvas.getContext('2d', {willReadFrequently: true}).drawImage(_tmpCanvas, 0, 0, TEX_SIZE, TEX_SIZE);

        return _ReSizeCanvas.getContext('2d', {willReadFrequently: true}).getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    }

    setTexturesDiffuse(arr = []) {

        _diffuses = [];

        for (let i = 0; i < arr.length; i++) _diffuses[i] = this.RepeatTexture(arr[i].image);
    }

    setTexturesNormal(arr = []) {

        _normals = [];

        for (let i = 0; i < arr.length; i++) _normals[i] = this.RepeatTexture(arr[i].image);
    }

    setColorsMap(canvas, size, count) {

        _colors = [];

        for (let i = 0; i < count; i++)  _colors[i] = this.setTexture2DArray(canvas.getContext('2d', {willReadFrequently: true}), i + 1, size);
    }

    LerpRGB(idMix1, mixСolor1 = [], mixСolor2 = [], alpha) {

        let r1 = mixСolor1[idMix1] / 255, g1 = mixСolor1[idMix1 + 1] / 255, b1 = mixСolor1[idMix1 + 2] / 255;
        const r2 = mixСolor2[0] / 255, g2 = mixСolor2[1] / 255, b2 = mixСolor2[2] / 255;

        r1 += (r2 - r1) * alpha;
        g1 += (g2 - g1) * alpha;
        b1 += (b2 - b1) * alpha;

        return [r1 * 255, g1 * 255, b1 * 255];
    }

    mixPixel(id, map = []) {

        let _mix = this.LerpRGB(id, map[0].data, [0, 0, 0], _colors[0].data[id + 0] / 255);
        _mix = this.LerpRGB(id, map[1].data, _mix, _colors[0].data[id + 1] / 255);
        _mix = this.LerpRGB(id, map[2].data, _mix, _colors[0].data[id + 2] / 255);

        _mix = this.LerpRGB(id, map[3].data, _mix, _colors[1].data[id + 0] / 255);
        _mix = this.LerpRGB(id, map[4].data, _mix, _colors[1].data[id + 1] / 255);
        _mix = this.LerpRGB(id, map[5].data, _mix, _colors[1].data[id + 2] / 255);

        _mix = this.LerpRGB(id, map[6].data, _mix, _colors[2].data[id + 0] / 255);
        _mix = this.LerpRGB(id, map[7].data, _mix, _colors[2].data[id + 1] / 255);
        _mix = this.LerpRGB(id, map[8].data, _mix, _colors[2].data[id + 2] / 255);

        _mix = this.LerpRGB(id, map[9].data, _mix, _colors[3].data[id + 0] / 255);
        _mix = this.LerpRGB(id, map[10].data, _mix, _colors[3].data[id + 1] / 255);
        _mix = this.LerpRGB(id, map[11].data, _mix, _colors[3].data[id + 2] / 255);

        _mix = this.LerpRGB(id, map[12].data, _mix, _colors[4].data[id + 0] / 255);
        _mix = this.LerpRGB(id, map[13].data, _mix, _colors[4].data[id + 1] / 255);

        return _mix;
    }

    mix() {

        let bufDiffuse = _MixCanvasDiffuse.getContext('2d', {willReadFrequently: true}).getImageData(0, 0, TEX_SIZE, TEX_SIZE);
        let bufNormal = _MixCanvasNormal.getContext('2d', {willReadFrequently: true}).getImageData(0, 0, TEX_SIZE, TEX_SIZE);

        for (let j = 0; j < TEX_SIZE ** 2; j++) {

            const _mixDiffuse = this.mixPixel(j * 4, _diffuses);
            const _mixNormal = this.mixPixel(j * 4, _normals);

            bufDiffuse.data[j * 4 + 0] = _mixDiffuse[0];
            bufDiffuse.data[j * 4 + 1] = _mixDiffuse[1];
            bufDiffuse.data[j * 4 + 2] = _mixDiffuse[2];
            bufNormal.data[j * 4 + 0] = _mixNormal[0];
            bufNormal.data[j * 4 + 1] = _mixNormal[1];
            bufNormal.data[j * 4 + 2] = _mixNormal[2];
        }

        _MixCanvasDiffuse.getContext('2d', {willReadFrequently: true}).putImageData(bufDiffuse, 0, 0);
        _MixCanvasNormal.getContext('2d', {willReadFrequently: true}).putImageData(bufNormal, 0, 0);

        return {diffuse: _MixCanvasDiffuse, normal: _MixCanvasNormal};
    }
}