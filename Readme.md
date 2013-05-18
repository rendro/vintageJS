# vintageJS
Add a retro/vintage effect to images using the HTML5 canvas element.

## How to use
You can decide to use vintageJS as a jQuery plugin or the vanilla version without any dependencies.

### jQuery

The jQuery version works with `jQuery 1.2.3+`

	<script src="//code.jquery.com/jquery-2.0.0.min.js"></script>
    <script src="jquery.vintage.js"></script>
    <script>
    	var options = {
    		onError: function() {
    			alert('ERROR');
    		}
    	};
    	var effect = {
    		vignette: 0.6,
    		sepia: true
    	};
    	$('img#yourImage').vintage(options, effect);
    </script>

### vanilla

 	<script src="vintage.js"></script>
    <script>
    	var img = document.getElementById('yourImage');
    	var options = {
    		onError: function() {
    			alert('ERROR');
    		}
    	};
    	var effect = {
    		vignette: 0.6,
    		sepia: true
    	};
    	new VintageJS(img, options, effect);
    </script>

## Options

You can configure vintageJS with the following options:

<table>
	<tr>
		<td><code>onStart</code></td>
		<td>Callback function that is executed before the effect is calculated</td>
	</tr>
	<tr>
		<td><code>onEnd</code></td>
		<td>Callback function that is executed after the effect is renderd</td>
	</tr>
	<tr>
		<td><code>onError</code></td>
		<td>Callback function that is executed if any error occures</td>
	</tr>
	<tr>
		<td><code>mime</code></td>
		<td>Mime type of the output image. Default is <code>image/jpeg</code></td>
	</tr>
</table>

## Effect options

In the `vintage.presets.js` file you find a few presets to see how the options work. If you have built a great effect by yourself, do not hesitate to send a pull request, I appreciate every contribution.

<table>
	<tr>
		<th>Name</th>
		<th>Value</th>
		<th>Description</th>
	</tr>
	<tr>
		<td><code>vignette</code></td>
		<td><i>float</i> from 0 to 1</td>
		<td>A black vignette a the edges of the image</td>
	</tr>
	<tr>
		<td><code>lighten</code></td>
		<td><i>float</i> from 0 to 1</td>
		<td>Lighten the center of the image</td>
	</tr>
	<tr>
		<td><code>desaturate</code></td>
		<td><i>float</i> from 0 to 1</td>
		<td>Desaturate the image</td>
	</tr>
	<tr>
		<td><code>noise</code></td>
		<td><i>integer</i></td>
		<td>Add a noise to the image. The bigger the number the stronger the noise</td>
	</tr>
	<tr>
		<td><code>sepia</code></td>
		<td><i>boolean</i></td>
		<td>Sepia effect</td>
	</tr>
	<tr>
		<td><code>viewFinder</code></td>
		<td><i>string</i>: path to image</td>
		<td>Add a viewfinder image</td>
	</tr>
	<tr>
		<td><code>screen</code></td>
		<td><i>object</i></td>
		<td>Screen in another color. The object must have the following structure: <pre><code>{
	r: (int)[0-255],
	g: (int)[0-255],
	b: (int)[0-255],
	a: (float):[0-1]
}</code></pre>
<code>r,b,g</code> represent the color and <code>a</code> defines the strength of the screen.
</td>
	</tr>
	<tr>
		<td><code>curves</code></td>
		<td><i>object</i></td>
		<td>Map one color value to another by providing an object with the properties <code>r,g,b</code> each containing an array with 256 enties for the color mapping: <pre><code>{
	r: (intArray){256}[0-255],
	g: (intArray){256}[0-255],
	b: (intArray){256}[0-255]
}</code></pre>
<code>r,b,g</code> representing the color and <code>a</code> defines the strength of the screen.
</td>
	</tr>
</table>

## vintage-API

Every instance of vintageJS returns an API object to manipulate the image. In the jQuery version this API is stored in the data of the element and can be accessed in the following way:

	var vjsAPI = $('#yourImage').data('vintageJS');

The API has the following two methods:

* `vintage(effect)`: Render a new effect for the image. The current effect will be overwritten.
* `apply()`: Apply the current effect on the image. All further effects are rendered on the basis of the current state of the image. Use this method if you want to render multiple effects on one image.

## Browser support

As vintageJS relies on the HTML5 canvas element it supports the following browsers:

* Mozilla Firefox
* Google Chrome
* Apple Safari
* Opera
* Internet Explorer 9+

See more details on [canisue.com/canvas](http://caniuse.com/canvas).
