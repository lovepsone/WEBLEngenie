/*
* author lovepsone
*/

import {CLASSTULLTIP, TOOLTIPWIND} from './../CONST.js';

let UI = document;
UI.getElement = document.getElementById;

let _elemCamera = null;
let _elemWireframe = null;
let _currentTab = 0;

class UIFrame {

	constructor(camera, wireframe) {

		_elemCamera = camera;
		_elemWireframe = wireframe;
	}

	CheckedCamera() {

		if (UI.getElement(_elemCamera).checked)
			return true;

		return false;
	}

	CheckedWireframe() {

		if (UI.getElement(_elemWireframe).checked)
			return true;

		return false;
	}

	setCurrentTab(id) {

		_currentTab =  Number.parseInt(id);
	}

	getCurrentTab() {

		return _currentTab;
	}
}

//let _html = "<span style = ''></span>";
let _ToolTips = null;

class ToolTip {

	constructor() {

		_ToolTips = document.querySelectorAll(`.${CLASSTULLTIP}`);
	}

	Int() {

		_ToolTips = document.querySelectorAll(`.${CLASSTULLTIP} .${TOOLTIPWIND}`);

		for (let i = 0; i < _ToolTips.length; i++) {

			_ToolTips[i].setAttribute('style', '');
			_ToolTips[i].style.position = 'fixed';
			_ToolTips[i].style.zIndex = '999px';
			_ToolTips[i].style.fontSize = '20px';
			_ToolTips[i].style.width = '240px';
			_ToolTips[i].style.height = '240px';
			_ToolTips[i].style.backgroundImage = UI.getElement(_ToolTips[i].parentNode.id).style.backgroundImage; //getComputedStyle(UI.getElement(_ToolTips[i].parentNode.id)).getPropertyValue("background-image")
			_ToolTips[i].style.opacity = '0.1';
			_ToolTips[i].style.display = 'none';

			UI.getElement(_ToolTips[i].parentNode.id).addEventListener("mouseover", function() {

				let opacity = 0.01;
				_ToolTips[i].style.display = 'block';

				let timer = setInterval(function() {

					if(opacity >= 1) clearInterval(timer);
					_ToolTips[i].style.opacity = opacity;
					opacity += opacity * 0.1;
				}, 10);
			}, false);

			UI.getElement(_ToolTips[i].parentNode.id).addEventListener("mousemove", function(event) {

				const x = event.pageX - 240;
				const y = event.pageY + 40;

				_ToolTips[i].style.left = `${x}px`;
				_ToolTips[i].style.top = `${y}px`;
			}, false);

			UI.getElement(_ToolTips[i].parentNode.id).addEventListener("mouseout", function() {

				let opacity = 1;

				let timer = setInterval(function() {
	
					if(opacity <= 0.1) {

						clearInterval(timer);
						_ToolTips[i].style.display = 'none';
					}

					_ToolTips[i].style.opacity = opacity;
					opacity -= opacity * 0.1;
				}, 10);
			}, false);
		}
	}

	setStyle(id, style) {

	}

	addImage(id, img) {

	}
};

UI.ToolTip = new ToolTip();

export {UI, UIFrame};