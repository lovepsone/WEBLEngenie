/*
* author lovepsone
*/

const _nameTextures =  {

    OCEAN:                      './texture/ocean_dirt_512.jpg', //0x44447a,
    BEACH:                      './texture/beach_512.jpg', //0xa09077,
    SCORCHED:                   './texture/scorched_512.jpg',//0x555555,
    BARE:                       './texture/bare_512.jpg',//0x888888,
    TUNDRA:                     './texture/tundra_512.jpg',//0xbbbbaa,
    SNOW:                       './texture/snow_512.jpg',//0xdddde4,
    TEMPERATE_DESERT:           './texture/temperate_desert_512.jpg',//0xc9d29b,
    TAIGA:                      './texture/taiga_512.jpg',//0x99aa77,
	GRASSLAND :                 './texture/grass_512.jpg',//0x88aa55,
	TEMPERATE_DECIDUOUS_FOREST: './texture/temperate_deciduous_forest_512.jpg',//0x679459,
	TEMPERATE_RAIN_FOREST:      './texture/temperate_rain_forest_512.jpg',//0x448855,
	SUBTROPICAL_DESERT:         './texture/subtropical_desert_512.jpg',//0xd2b98b,
	TROPICAL_SEASONAL_FOREST:   './texture/tropical_seasonal_forest_512.jpg',//0x559944,
	TROPICAL_RAIN_FOREST:       './texture/tropical_rain_forest_512.jpg' //0x337755
};

const _datatextures = Object.entries(_nameTextures);
let _Texture2DArray = null;
let  _textures = [];

class TextureAtlas {

    constructor() {

        for (let i = 0; i < _datatextures.length; i++) {

            _textures[i] = new THREE.TextureLoader().load(_datatextures[i][1]);
            _textures[i].name = _datatextures[i][1]; // need fixed
            _textures[i].wrapS =_textures[i].wrapT = THREE.RepeatWrapping;
        }
    }

    setBiomeMap(img) {

        _Texture2DArray = new THREE.DataTexture2DArray(_DiffuseCanvas.getContext('2d').getImageData(0, 0, _width, _height*5).data, _width, _height, 5);
        _Texture2DArray.format = THREE.RGBAFormat;
        _Texture2DArray.type = THREE.UnsignedByteType;
        _Texture2DArray.anisotropy = 2;
    }

    generateMaterial(terrain) {

        let vShader = `
            #version 300 es
            out vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        let fShader = `
            #version 300 es

            precision highp sampler2DArray;
            precision highp float;
            precision highp int;

            uniform sampler2D OCEAN;
            uniform sampler2D BEACH;
            uniform sampler2D SCORCHED;
            uniform sampler2D BARE;
            uniform sampler2D TUNDRA;
            uniform sampler2D SNOW;
            uniform sampler2D TEMPERATE_DESERT;
            uniform sampler2D TAIGA;
            uniform sampler2D GRASSLAND;
            uniform sampler2D TEMPERATE_DECIDUOUS_FOREST;
            uniform sampler2D TEMPERATE_RAIN_FOREST;
            uniform sampler2D SUBTROPICAL_DESERT;
            uniform sampler2D TROPICAL_SEASONAL_FOREST;
            uniform sampler2D TROPICAL_RAIN_FOREST;
            in vec2 vUv;
            uniform sampler2DArray diffuse;

            out vec4 out_FragColor;


            float getCoord(int layer, int count) {

                return max(0.0, min(float(count) - 1.0, floor(float(layer) + 0.5)));
            }

            void main() {

                vec4 test = texture(diffuse, vec3(vUv, 0.0));//getCoord(0, 5)
                vec4 test2 = texture(diffuse, vec3(vUv, 1.0));
                vec4 test3 = texture(diffuse, vec3(vUv, 2.0));
                vec4 test4 = texture(diffuse, vec3(vUv, 3.0));
                vec4 test5 = texture(diffuse, vec3(vUv, 4.0));

                vec4 _okean = texture2D(OCEAN, vUv*10.0);
                vec4 _beach = texture2D(BEACH, vUv* 10.0);
                vec4 _scorched = texture2D(SCORCHED, vUv* 10.0);

                vec4 _bare = texture2D(BARE, vUv* 10.0);
                vec4 _tundra = texture2D(TUNDRA, vUv* 10.0);
                vec4 _snow = texture2D(SNOW, vUv* 10.0);

                vec4 _temperate_desert = texture2D(TEMPERATE_DESERT, vUv* 10.0);
                vec4 _taiga = texture2D(TAIGA, vUv* 10.0);
                vec4 _grassland = texture2D(GRASSLAND, vUv* 10.0);

                vec4 _temperate_decidious_forest = texture2D(TEMPERATE_DECIDUOUS_FOREST, vUv* 10.0);
                vec4 _temperate_rain_forest = texture2D(TEMPERATE_RAIN_FOREST, vUv* 10.0);
                vec4 _subtropical_desert = texture2D(SUBTROPICAL_DESERT, vUv* 10.0);

                vec4 _tropical_seasonal_forest = texture2D(TROPICAL_SEASONAL_FOREST, vUv* 10.0);
                vec4 _tropical_rain_forest = texture2D(TROPICAL_RAIN_FOREST, vUv* 10.0);


                vec4 mix1 = mix(_okean, vec4(0.0, 0.0, 0.0, 1.0), test.r);
                vec4 mix2 = mix(_beach, mix1, test.g);
                vec4 mix3 = mix(_scorched, mix2, test.b);
                vec4 mix4 = mix(_bare, mix3, test2.r);
                vec4 mix5 = mix(_tundra, mix4, test2.g);
                vec4 mix6 = mix(_snow, mix5, test2.b);
                vec4 mix7 = mix(_temperate_desert, mix6, test3.r);
                vec4 mix8 = mix(_taiga, mix7, test3.g);
                vec4 mix9 = mix(_grassland, mix8, test3.b);
                vec4 mix10 = mix(_temperate_decidious_forest, mix9,test4.r);
                vec4 mix11 = mix(_temperate_rain_forest, mix10, test4.g);
                vec4 mix12 = mix(_subtropical_desert, mix11, test4.b);
                vec4 mix13 = mix(_temperate_rain_forest, mix12, test5.r);
                vec4 mix14 = mix(_temperate_rain_forest, mix13, test5.g);
                out_FragColor = mix14;
            }
            `;

        let customUniforms = {
            diffuse:                    {value: _Texture2DArray},
            OCEAN:	                    {type: "t", value: _textures[0]},
            BEACH:	                    {type: "t", value: _textures[1]},
            SCORCHED:	                {type: "t", value: _textures[2]},
            BARE:	                    {type: "t", value: _textures[3]},
            TUNDRA:	                    {type: "t", value: _textures[4]},
            SNOW:	                    {type: "t", value: _textures[5]},
            TEMPERATE_DESERT:	        {type: "t", value: _textures[6]},
            TAIGA:	                    {type: "t", value: _textures[7]},
            GRASSLAND:	                {type: "t", value: _textures[8]},
            TEMPERATE_DECIDUOUS_FOREST:	{type: "t", value: _textures[9]},
            TEMPERATE_RAIN_FOREST:	    {type: "t", value: _textures[10]},
            SUBTROPICAL_DESERT:	        {type: "t", value: _textures[11]},
            TROPICAL_SEASONAL_FOREST:	{type: "t", value: _textures[12]},
            TROPICAL_RAIN_FOREST:	    {type: "t", value: _textures[13]},
        };

        _material = new THREE.ShaderMaterial({
            uniforms:customUniforms,
            vertexShader: vShader,
            fragmentShader: fShader
        });

        terrain.material = _material;
        terrain.material.needsUpdate = true;
    }
}

export {TextureAtlas}