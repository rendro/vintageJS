#vintageJS#
##Vintage effects for your images with the HTML5 canvas element##
vintageJS is a jQuery plugin that uses the html5 canvas element to add a great vintage look to your photos. It comes with three effect-presets and can be customized very easily.

###Requirements###
To use vintageJS you need the latest jQuery build from [jquery.com](http://www.jquery.com), a browser that supports the HTML5 canvas element and the current version of <span class="vjs">vintageJS</span> from [github](http://www.github.com/rendro/vintageJS/).

This jQuery-Plugin was tested in the following browsers:

* Mozilla FireFox 3.16.14
* Google Chrome 9.0.597.107
* Apple Safari 5.0.3
* Opera 11.01 (strange color behaviour but I could not figure out why)
* Internet Explorer 7+ (won't work because the canvas element is not supported, but at least the error message appears)

###Usage###

You need to load the jQuery Library, the vintageJS Library and the vintageJS stylesheet in the header of your html document:

    <script src="src/jquery.js"></script>
    <script src="src/vintage.js"></script>
    <link rel="stylesheet" type="text/css" href="css/vintagejs.css" media="all" />

The next step is to add an event listener to the images to trigger the vintage-effect. For this example we will use the click event:

    <script>
    $(function () {
        $('img.vintage').click(function () {
            $(this).vintage();
        });
    });
    </script>


That's it! Now add images with the class "vintage" to your html and click on them to see the result.

###Options###

You can change the effect by adding options to the vintageJS call. There are three presets that you can use:

* `default`: the default preset is used when no preset is given
* `sepia`: sepia effect
* `grayscale`: turns image into grayscale image
* `custom`: Only curves will be adjusted, all the other effects are switched off so that you can build your own vintage look

If you like to change the style to your own settings, here are the full options you can manipulate:

* `vignette`: To avoid the vignette effect set this option to false. Otherwise you need to set it to a literal object with "black" and "white" as variables between 0 and 1 to set the strength of the vignette effect. Example: `vignette: {black:0.5, white:0.2}`
* `noise`: How much noise do you want to add to your image.
* `screen`: Add a layer with the photoshop like blending mode "screen" to blur out colors. You can define a solid color and the opacity of the layer. Example: `screen: { red: 227, green: 12, blue: 169, strength: 0.1 }`
* `desaturate`: False or value between 0 and 1, which is the percentage how much the image is desaturated
* `allowMultiEffect`: If this flag is set to true, you may trigger the effect multiple times. Default value is false.

Here is how a custom call could look like:

    <script>
    $(function () {
        $('img.vintage').click(function () {
            $(this).vintage({
                vignette: {
                    black: 0.8,
                    white: 0.2
                },
                noise: 20,
                screen: {
                    red: 12,
                    green: 75,
                    blue: 153,
                    strength: 0.3
                },
                desaturate: 0.05
            });
        });
    });
    </script>
