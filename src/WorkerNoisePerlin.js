/*
* author lovepsone
* Noise Perlin
*/

let _table = [];

let _width = 128, _height = 128;
let _step = 140, _factor = 1, _min = 1000, _max = 0;

let _RangeMax = 0.0, _RangeMin = 0.0;

let _tmp, current_MIN = 0; current_MAX = 100; // class Reverter

class Reverter {

	constructor(data, min, max) {

		this.values = data;
		_tmp = data;
		current_MIN = min;
		current_MAX = max;
	}

	reverting(val) {

		return (val - current_MIN) / (current_MAX - current_MIN);
	}

	mapper() {

		let buff = [];
		for (let i = 0; i < _width; i++) {

			for (let j = 0; j < _height; j++) {

				_tmp[i][j] = this.reverting(_tmp[i][j]);
				buff.push(this.values[i][j]);
			}
		}

		return buff;
	}
}

class NoisePerlin {

	constructor(width, height) {

		for(let i = 0; i< 1024; i++) {

			_table.push(Math.round((Math.random()*100)));
		}

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
	
		let data = [];

		for(let i = 0; i < ((_width - 1)/_step); i += 1/_step) {

			data.push([]);

			for(let j = 0; j < ((_height - 1)/_step); j += 1/_step) {
				
				let color = this.Octave(i, j, 8);

				_max = color > _max ? color : _max;
				_min = color < _min ? color : _min;

				color = Math.round((color + 0.4) * 255);

				if (_RangeMax < color) _RangeMax = color;
				if (_RangeMin > color) _RangeMin = color;

				data[Math.round(i * _step)][Math.round(j * _step)] = color;
			}
		}

		let revert = new Reverter(data, _RangeMin, _RangeMax);
		return data;//revert.mapper();
	}

}

let perlin = null;

self.onmessage = function(e) {

    let data = e.data;

    switch(data.cmd) {

        case 'start':
				perlin = new NoisePerlin(data.size.width, data.size.height);
				let buff = perlin.generate();
				self.postMessage(buff);
            break;
        case 'stop':
            break;
    }
};