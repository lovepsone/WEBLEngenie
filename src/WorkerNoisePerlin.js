/*
* author lovepsone
* Noise Perlin
*/

let _table = [];

let _width = 128, _height = 128;
let _step = 140, _factor = 1, _min = 1000, _max = 0;

class NoisePerlin {

	constructor(width, height) {

		_width = width /_factor;
		_height = height /_factor;
	}

	setSize(width, height) {

		_width = width /_factor;
		_height = height /_factor;
	}

	GetPseudoRandomGradientVector(x, y) {

		let v = ((x*1231 ^ y*8544)+4212)&1023;
		v = _table[v]&3;
		
		switch(v) {
			case 0: return [1,0]; break;
			case 1: return [-1,0]; break;
			case 2: return [0,1]; break;
			default : return [0,-1]
		}
	}

	QunticCurve(t) {
		
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	//Interpolation
	Lerp(a, b, t) {
		
		return a + (b - a) * t;
	}

	Dot(a, b) {
		
		return a[0] * b[0] + a[1] * b[1];
	}

	Noise(fx, fy) {
		
		let left = Math.floor(fx);
		let top = Math.floor(fy);
	
		let pointInQuadX = fx - left;
		let pointInQuadY = fy - top;
	
		let topLeftGradient     = this.GetPseudoRandomGradientVector(left,   top  );
		let topRightGradient    = this.GetPseudoRandomGradientVector(left+1, top  );
		let bottomLeftGradient  = this.GetPseudoRandomGradientVector(left,   top+1);
		let bottomRightGradient = this.GetPseudoRandomGradientVector(left+1, top+1);
	
		let distanceToTopLeft     = [pointInQuadX,    pointInQuadY];
		let distanceToTopRight    = [pointInQuadX-1,  pointInQuadY];
		let distanceToBottomLeft  = [pointInQuadX,    pointInQuadY-1];
		let distanceToBottomRight = [pointInQuadX-1,  pointInQuadY-1];
	
		let tx1 = this.Dot(distanceToTopLeft,     topLeftGradient);
		let tx2 = this.Dot(distanceToTopRight,    topRightGradient);
		let bx1 = this.Dot(distanceToBottomLeft,  bottomLeftGradient);
		let bx2 = this.Dot(distanceToBottomRight, bottomRightGradient);
	
		pointInQuadX = this.QunticCurve(pointInQuadX);
		pointInQuadY = this.QunticCurve(pointInQuadY);
	
		let tx = this.Lerp(tx1, tx2, pointInQuadX);
		let bx = this.Lerp(bx1, bx2, pointInQuadX);
		let tb = this.Lerp(tx, bx, pointInQuadY);
	
		return tb;
	}

	Octave(fx, fy, octaves) {
		
		let persistance = 0.5;
		let amplitude = 1;
		let max = 0;
		let result = 0;
		
		while(octaves-- > 0) {
			
			max += amplitude;
			result += this.Noise(fx, fy) * amplitude;
			amplitude *= persistance;
			fx *= 2;
			fy *= 2;
		}

		return result / max;
	}

	generate() {
	
		_table = [];
		for(let i = 0; i< 1024; i++) {

			_table.push(Math.round((Math.random()*100)));
		}

		let data = [];

		for(let i = 0; i < ((_width - 1)/_step); i += 1/_step) {

			data.push([]);

			for(let j = 0; j < ((_height - 1)/_step); j += 1/_step) {
				
				let color = this.Octave(i, j, 8);

				_max = color > _max ? color : _max;
				_min = color < _min ? color : _min;

				color = Math.round((color + 0.4) * 255);

				data[Math.round(i * _step)][Math.round(j * _step)] = color;
			}
		}

		return data;
	}

	RevertPixels(pixels) {

		let buff = [], max = 0, min = 10000;

		for (let i = 0, n = pixels.data.length; i < n; i += 4) {

			let tmp = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
			tmp = tmp / 255;
			tmp = tmp * 100;
			buff.push(tmp);

            if (max < tmp) max = tmp;
            if (min > tmp) min = tmp;
		}

		for (let i = 0; i < buff.length; i++) {

			buff[i] = (buff[i] - min) / (max - min);
		}

		return buff;
	}
}

let perlin = new NoisePerlin(128, 128);

self.onmessage = function(e) {

    let data = e.data;

    switch(data.cmd) {

        case 'start':
				perlin.setSize(data.size.width, data.size.height);
				self.postMessage({'cmd': 'draw', 'colors':  perlin.generate()});
            break;
        case 'pixels':
				self.postMessage({'cmd': 'complete', 'result': perlin.RevertPixels(data.data)});
            break;
    }
};