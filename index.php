<?php
/*
* author lovepsone
*
*/
	echo '<!DOCTYPE html><html>';
	echo '<head>';
	echo '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';
	echo '<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">';
	echo '<title></title>';
	echo '<script type="module" src="src/modules.js"></script>';
	echo '<link rel="stylesheet" href="style.css">';
	echo '</head><body>';
	
	echo '<script type="x-shader/x-vertex" id="vertexshader">';
	?>
			attribute float size;
			attribute vec3 customColor;
			varying vec3 vColor;
			void main() {
				vColor = customColor;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_PointSize = size * ( 300.0 / -mvPosition.z );
				gl_Position = projectionMatrix * mvPosition;
			}
	<?php
	echo '</script>';

	echo '<script type="x-shader/x-fragment" id="fragmentshader">';
	?>
			uniform vec3 color;
			uniform sampler2D texture;
			varying vec3 vColor;
			void main() {
				gl_FragColor = vec4( color * vColor, 1.0 );
				gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
				if ( gl_FragColor.a < ALPHATEST ) discard;
			}
	<?php
	echo '</script></body></html>';
?>