/*
* @author lovepsone 2019 - 2023
*/

class LoaderHTML5 {

	constructor(json) {

		this.ReadJSON(json);
	}

	ReadJSON(json) {

		if (json instanceof Array == true && typeof json[0]['tag'] !== "undefined") {

			this.ReadBlock(json);
		} else {
			console.error('Error in the code block json!!!');
		}

	}
	
	ReadBlock(block) {
	
		for (let i = 0; i < block.length; i++) {
			this.ReadElems(block[i], 'body');
		}
	}
	
	ReadElems(elems, pre_id) {

		var element = document.createElement(elems['tag']),
		_id = this.getID(elems['id']);
		element.id = _id;
		//
		if (this.getAttr(elems['class'])) 		element.setAttribute('class',elems['class']);
		if (this.getAttr(elems['contextmenu'])) element.setAttribute('contextmenu', elems['contextmenu']);
		if (this.getAttr(elems['dir'])) 		element.setAttribute('dir', elems['dir']);
		if (this.getAttr(elems['accesskey'])) 	element.setAttribute('accesskey', elems['accesskey']);
		if (this.getAttr(elems['contenteditable'])) element.setAttribute('contenteditable', elems['contenteditable']);
		if (this.getAttr(elems['visibility']))	element.setAttribute('visibility', elems['visibility']);
		if (this.getAttr(elems['lang'])) 		element.setAttribute('lang', elems['lang']);
		if (this.getAttr(elems['spellcheck'])) 	element.setAttribute('spellcheck', elems['spellcheck']);
		if (this.getAttr(elems['style']))		element.style.cssText = elems['style'];
		if (this.getAttr(elems['tabindex'])) 	element.setAttribute('tabindex', elems['tabindex']);
		if (this.getAttr(elems['title'])) 		element.setAttribute('title', elems['title']);
		if (this.getAttr(elems['text']))		element.innerHTML = elems['text'];
		if (this.getAttr(elems['align']))		element.setAttribute('align', elems['align']);
		// form
		//accept-charset
		//autocomplete
		if (this.getAttr(elems['enctype']))		element.setAttribute('enctype', elems['enctype']);
		if (this.getAttr(elems['method']))		element.setAttribute('method', elems['method']);
		if (this.getAttr(elems['name']))		element.setAttribute('name', elems['name']);
		if (this.getAttr(elems['action']))		element.setAttribute('action', elems['action']);
		// input
		if (this.getAttr(elems['selected']))		element.setAttribute('selected', elems['selected']);
		if (this.getAttr(elems['checked']))		element.setAttribute('checked', elems['checked']);
		//disabled 
		//form
		//autofocus 
		//formaction
		if (this.getAttr(elems['max']))			element.setAttribute('max', elems['max']);
		if (this.getAttr(elems['min']))			element.setAttribute('min', elems['min']);
		if (this.getAttr(elems['type']))		element.setAttribute('type', elems['type']);
		if (this.getAttr(elems['size']))		element.setAttribute('size', elems['size']);
		if (this.getAttr(elems['value']))		element.setAttribute('value', elems['value']);
		// label
		if (this.getAttr(elems['for']))			element.setAttribute('for', elems['for']);
		if (this.getAttr(elems['data-tooltip-css'])) element.setAttribute('data-tooltip-css', elems['data-tooltip-css']);
 
		let preElement = this.setElement(pre_id);
		preElement.appendChild(element);

		if (typeof elems.children !== "undefined" && elems.children.length > 0) {

			for (let i = 0; i < elems.children.length; i++) {

				this.ReadElems(elems.children[i], _id);
			}
		}
	}

	setElement(PreID) {

		if (PreID == 'body') {

			return document.body;
		}

		return document.getElementById(PreID);
	}

	getID(id) {

		if (typeof id !== "undefined") {
			return id;
		}

		let buf = 'non-', b = "abcdefghijklmnopqrstuvwxyz";
		
		while (buf.length < 10) {

			buf += b[Math.floor(Math.random() * b.length)];
		}

		return buf;
	}

	getAttr(attr) {

		if (typeof attr !== "undefined") {
			return true;
		}
		return false;
	}
}

export {LoaderHTML5};