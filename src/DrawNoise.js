/*
* Author lovepsone
*/

let _width = 0, _height = 0;

let canvas = document.createElement('canvas'), ctx = null;
let colors = ['#555', '#171717', '#f44336', '#2196f3', '#4caf50'];
let cellSize = 1;

let matrix = null;

class DrawNoise {

	constructor(width = 128, height = 128, elemId = 'CanvasGenNoise') {

        _width = width * cellSize;
        _height = height * cellSize;
        canvas.width = _width;
        canvas.height = _height;

        canvas.style.width = "256px";
        canvas.style.height = "256px";

		ctx = canvas.getContext('2d');
        document.getElementById(elemId).appendChild(canvas);
        matrix = [];

        for(let i = 0; i < _width; i++) {

            matrix.push([]);
            
            for(var j = 0; j < _height; j++) {

                matrix[i].push(1);
            }
        }
    
        this.Field(matrix);
    }

    Field(data) {
        
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let x = 0; x < canvas.height / cellSize; x++) {
            
            for (let y = 0; y < canvas.width / cellSize; y++) {
                
                ctx.fillStyle = colors[data[x][y]];
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
    
    Point = function(x, y, color){

        ctx.fillStyle = 'rgb('+color+','+color+','+color+')'
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
    
    clearField() {

        matrix = [];
        
        for(let i = 0; i < _width; i++) {
            
            matrix.push([]);
            
            for(let j = 0; j < _height; j++) {
                
                matrix[i].push(1);
            }
        }
        
        this.Field(matrix);
    }

    getMatrix() {

        return matrix;
    }

    setMatrix(x, y, value) {

        matrix[x][y] = value;
        this.Point(x, y, value);
    }

    setSize(width, height) {

        ctx.clearRect(0, 0, _width, _height);

        _width = width * cellSize;
        _height = height * cellSize;
        canvas.width = _width;
        canvas.height =  _height;
        this.clearField();

    }

    getSize() {

        return {width: _width, height: _height};
    }
}

export {DrawNoise};