/*
* @author lovepsone 2019 - 2023
*/

import * as THREE from './../libs/three.module.js';

let _container = document.createElement( 'div' ), _UpdateTxt = [], _lastTime = null;

class RenderInfo {

    constructor() {

        _container.style.cssText = 'position:fixed;bottom:48px;left:0;width:80px;opacity:0.9;cursor:pointer;z-index:10000;';

        const block	= document.createElement('div');
        block.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002;';
        _container.appendChild(block);

        const blockTxt = document.createElement('div');
        blockTxt.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
        blockTxt.innerHTML= 'WebGLRenderer';
        block.appendChild(blockTxt);

        for(let i = 0; i < 10; i++){

            _UpdateTxt[i]	= document.createElement('div');
            _UpdateTxt[i].style.cssText = 'color:#0ff;background-color:#002;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
            block.appendChild(_UpdateTxt[i]);		
            _UpdateTxt[i].innerHTML = '-';
        }

        _lastTime = Date.now();
    }

    getDOmElement() {

        return _container;
    }

    update(Renderer) {

        if(Date.now() - _lastTime < 1000 / 30) return;

        _lastTime = Date.now();

        console.assert(Renderer instanceof THREE.WebGLRenderer);

        _UpdateTxt[0].textContent = '';//`Programs: ${Renderer.info.programs}`;
        _UpdateTxt[1].textContent = '== Memory =====';
        _UpdateTxt[2].textContent = `Geometries: ${Renderer.info.memory.geometries}`;
        _UpdateTxt[3].textContent = `Textures: ${Renderer.info.memory.textures}`;

        _UpdateTxt[4].textContent = '== Render =====';
        _UpdateTxt[5].textContent = `Calls: ${Renderer.info.render.calls}`;
        _UpdateTxt[6].textContent = `Triangles: ${Renderer.info.render.triangles}`;
        _UpdateTxt[7].textContent = `Points: ${Renderer.info.render.points}`;
        _UpdateTxt[8].textContent = `Lines: ${Renderer.info.render.lines}`;
        _UpdateTxt[9].textContent = `Frame: ${Renderer.info.render.frame}`;
    }
}

export {RenderInfo};