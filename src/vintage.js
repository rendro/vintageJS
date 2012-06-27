/**
 * vintageJS is a jQuery plugin that uses the HTML5 canvas element to add a vintage look to images
 *
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Built on top of the jQuery library
 * http://jquery.com
 *
 *
 * @author Robert Fleischmann
 * @version 1.0.0
 */
jQuery.fn.vintage = function (options) {

    /**
     * RGB-Curves for vintage effect
     */
    var r = [0, 0, 0, 1, 1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 19, 19, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 39, 40, 41, 42, 44, 45, 47, 48, 49, 52, 54, 55, 57, 59, 60, 62, 65, 67, 69, 70, 72, 74, 77, 79, 81, 83, 86, 88, 90, 92, 94, 97, 99, 101, 103, 107, 109, 111, 112, 116, 118, 120, 124, 126, 127, 129, 133, 135, 136, 140, 142, 143, 145, 149, 150, 152, 155, 157, 159, 162, 163, 165, 167, 170, 171, 173, 176, 177, 178, 180, 183, 184, 185, 188, 189, 190, 192, 194, 195, 196, 198, 200, 201, 202, 203, 204, 206, 207, 208, 209, 211, 212, 213, 214, 215, 216, 218, 219, 219, 220, 221, 222, 223, 224, 225, 226, 227, 227, 228, 229, 229, 230, 231, 232, 232, 233, 234, 234, 235, 236, 236, 237, 238, 238, 239, 239, 240, 241, 241, 242, 242, 243, 244, 244, 245, 245, 245, 246, 247, 247, 248, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 254, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        g = [0, 0, 1, 2, 2, 3, 5, 5, 6, 7, 8, 8, 10, 11, 11, 12, 13, 15, 15, 16, 17, 18, 18, 19, 21, 22, 22, 23, 24, 26, 26, 27, 28, 29, 31, 31, 32, 33, 34, 35, 35, 37, 38, 39, 40, 41, 43, 44, 44, 45, 46, 47, 48, 50, 51, 52, 53, 54, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75, 76, 77, 79, 80, 81, 83, 84, 85, 86, 88, 89, 90, 92, 93, 94, 95, 96, 97, 100, 101, 102, 103, 105, 106, 107, 108, 109, 111, 113, 114, 115, 117, 118, 119, 120, 122, 123, 124, 126, 127, 128, 129, 131, 132, 133, 135, 136, 137, 138, 140, 141, 142, 144, 145, 146, 148, 149, 150, 151, 153, 154, 155, 157, 158, 159, 160, 162, 163, 164, 166, 167, 168, 169, 171, 172, 173, 174, 175, 176, 177, 178, 179, 181, 182, 183, 184, 186, 186, 187, 188, 189, 190, 192, 193, 194, 195, 195, 196, 197, 199, 200, 201, 202, 202, 203, 204, 205, 206, 207, 208, 208, 209, 210, 211, 212, 213, 214, 214, 215, 216, 217, 218, 219, 219, 220, 221, 222, 223, 223, 224, 225, 226, 226, 227, 228, 228, 229, 230, 231, 232, 232, 232, 233, 234, 235, 235, 236, 236, 237, 238, 238, 239, 239, 240, 240, 241, 242, 242, 242, 243, 244, 245, 245, 246, 246, 247, 247, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 254, 255],
        b = [53, 53, 53, 54, 54, 54, 55, 55, 55, 56, 57, 57, 57, 58, 58, 58, 59, 59, 59, 60, 61, 61, 61, 62, 62, 63, 63, 63, 64, 65, 65, 65, 66, 66, 67, 67, 67, 68, 69, 69, 69, 70, 70, 71, 71, 72, 73, 73, 73, 74, 74, 75, 75, 76, 77, 77, 78, 78, 79, 79, 80, 81, 81, 82, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 88, 89, 89, 90, 90, 91, 91, 93, 93, 94, 94, 95, 95, 96, 97, 98, 98, 99, 99, 100, 101, 102, 102, 103, 104, 105, 105, 106, 106, 107, 108, 109, 109, 110, 111, 111, 112, 113, 114, 114, 115, 116, 117, 117, 118, 119, 119, 121, 121, 122, 122, 123, 124, 125, 126, 126, 127, 128, 129, 129, 130, 131, 132, 132, 133, 134, 134, 135, 136, 137, 137, 138, 139, 140, 140, 141, 142, 142, 143, 144, 145, 145, 146, 146, 148, 148, 149, 149, 150, 151, 152, 152, 153, 153, 154, 155, 156, 156, 157, 157, 158, 159, 160, 160, 161, 161, 162, 162, 163, 164, 164, 165, 165, 166, 166, 167, 168, 168, 169, 169, 170, 170, 171, 172, 172, 173, 173, 174, 174, 175, 176, 176, 177, 177, 177, 178, 178, 179, 180, 180, 181, 181, 181, 182, 182, 183, 184, 184, 184, 185, 185, 186, 186, 186, 187, 188, 188, 188, 189, 189, 189, 190, 190, 191, 191, 192, 192, 193, 193, 193, 194, 194, 194, 195, 196, 196, 196, 197, 197, 197, 198, 199];

    /**
     * default options for the aging effects
     */
    var defaultOptions = {
        vignette: {
            black: 0.6,
            white: 0.1
        },
        noise: 20,
        screen: {
            red: 227,
            green: 12,
            blue: 169,
            strength: 0.1
        },
        desaturate: false,
        allowMultiEffect: false,
        mime: 'image/jpeg',
        viewFinder: false
    };
    
    /**
     * green options for the aging effects
     */
    var greenOptions = {
        vignette: {
            black: 0.6,
            white: 0.1
        },
        noise: 20,
        screen: {
            red: 255,
            green:255,
            blue: 0,
            strength: 0.1
        },
        desaturate: false,
        allowMultiEffect: false,
        mime: 'image/jpeg',
        viewFinder: false
    };
    
    /**
     * grayscale options for the aging effects
     */
    var grayscaleOptions = {
        vignette: {
            black: 0.7,
            white: 0.2
        },
        noise: 25,
        screen: false,
        desaturate: 1,
        allowMultiEffect: false,
        mime: 'image/jpeg',
        viewFinder: false
    };
    
    /**
     * sepia options for the aging effects
     */
    var sepiaOptions = {
        vignette: {
            black: 0.6,
            white: 0.1
        },
        noise: 25,
        screen: {
            red: 141,
            green: 107,
            blue: 3,
            strength: 0.47
        },
        desaturate: 0.7,
        allowMultiEffect: false,
        mime: 'image/jpeg',
        viewFinder: false
    };

    /**
     * custom options for the aging effects: do nothing that is not indended
     */
    var customOptions = {
        vignette: false,
        noise: false,
        screen: false,
        desaturate: false,
        allowMultiEffect: true,
        mime: 'image/jpeg',
        viewFinder: false
    };

    /**
     * Load default preset options or custom configuration
     */
    options = options || {};
    options.preset = options.preset || 'default';
    switch (options.preset) {
        case 'custom':
            options = jQuery.extend(customOptions, options);
            break;
        case 'green':
            options = jQuery.extend(greenOptions, options);
            break;
        case 'sepia':
            options = jQuery.extend(sepiaOptions, options);
            break;
        case 'grayscale':
            options = jQuery.extend(grayscaleOptions, options);
            break;
        default:
            options = jQuery.extend(defaultOptions, options);
            break;
    }

    

    return this.each(function () {

        var obj = jQuery(this),
            ctx,
            canvas,
            loader;

        /**
         * Check if the object is an image
         */
        if (!obj.is('img')) {
            return;
        }

        /**
         * Set Flag if allowMultiEffect is false and stop script if it was executed before and allowMultiEffect is false
         */
        if (options.allowMultiEffect === false) {
            if (obj.data('vintage-applied') !== true) {
                obj.data('vintage-applied', true);
            } else {
                return;
            }
        }

        /**
         * Add loader on top of the image and start the image manipulation routine
         */
        var initVintage = function () {
            var pos = obj.offset();
            pos.top += Math.round(obj.height()/2);
            pos.left += Math.round(obj.width()/2);
            loader = jQuery('<div class="vintage-loader">Loading&hellip;</div>');
            loader.css('top',pos.top+'px').css('left',pos.left+'px').hide().appendTo('body').fadeTo(0, 0.8, function () {
                process();
            });
        };


        /**
         * The image manipulation routine:
         * At first a canvas element will be created and the source image is drawn on it.
         * After that all the effects are applied to the canvas as defined in the options object.
         * To finish the process, the image data is converted into a base64 string which will overwrite the src attribute of the source image
         */
        var process = function () {
            
            canvas = jQuery('<canvas></canvas>').get(0);

            if (!canvas.getContext) {
                loader.addClass('error').html('Your browser does not support the canvas element.').animate({opacity:'+=0'},3000,function () {
                    $(this).fadeOut(300, function () {
                        $(this).remove();
                    });
                });
            } else {
                ctx = canvas.getContext('2d');
                //create image object
                var image = new Image();
                //set image source
                image.src = obj.attr('src');
                //bind onload function to manipulate the image
                image.onload = function () {

                    //resize canvas
                    canvas.width = this.width;
                    canvas.height = this.height;

                    //draw image
                    ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height);

                    if (options.vignette !== false) {
                        addVignetteEffect();
                    }

                    manipulatePixels(function () {
                        //replace source with BASE64 code
                        obj.attr('src', canvas.toDataURL(options.mime));
                        loader.remove();
                        if (typeof(options.callback) == 'function') {
                            options.callback();
                        }
                    });
                };
            }
        };

        /**
         * Adds a vignette effect to the canvas with a lighten effect in the middle and a darken effect on the edges
         */
        var addVignetteEffect = function () {
            var gradient;
            var outerRadius = Math.sqrt( Math.pow(canvas.width/2, 2) + Math.pow(canvas.height/2, 2) );
            ctx.globalCompositeOperation = 'source-over';
            gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, outerRadius);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(0.65, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,' + options.vignette.black + ')');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'lighter';
            gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, outerRadius);
            gradient.addColorStop(0, 'rgba(255,255,255,' + options.vignette.white + ')');
            gradient.addColorStop(0.65, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        /**
         * the manipulatePixels routine loops through the imageData array of the canvas.
         * Depending on the option settings the curves are adjusted, all pixels are multiplied negativly with a color layer (similar to the photoshop blending mode "screen",
         * and a noise effect is added.
         */
        var manipulatePixels = function (callback) {

            var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

            for (var i=0; i < imageData.data.length; i+=4) {
                
                //adjust curves
                if (options.desaturate !== false) {

                    var average = ( r[imageData.data[i]] + g[imageData.data[i+1]] + b[imageData.data[i+2]] ) / 3;
                    
                    imageData.data[i  ] += Math.round( ( average - imageData.data[i  ] ) * options.desaturate );
                    imageData.data[i+1] += Math.round( ( average - imageData.data[i+1] ) * options.desaturate );
                    imageData.data[i+2] += Math.round( ( average - imageData.data[i+2] ) * options.desaturate );

                } else {
                    imageData.data[i  ] = r[imageData.data[i  ]];
                    imageData.data[i+1] = g[imageData.data[i+1]];
                    imageData.data[i+2] = b[imageData.data[i+2]];
                }

                // screen layer mode with solid color rbg(227,12,169) and 10% opacity
                if (options.screen !== false) {
                    imageData.data[i  ] = 255 - ((255 - imageData.data[i  ]) * (255 - options.screen.red * options.screen.strength) / 255);
                    imageData.data[i+1] = 255 - ((255 - imageData.data[i+1]) * (255 - options.screen.green * options.screen.strength) / 255);
                    imageData.data[i+2] = 255 - ((255 - imageData.data[i+2]) * (255 - options.screen.blue * options.screen.strength) / 255);
                }

                //add noise
                if (options.noise > 0) {
                    var noise = Math.round(options.noise - Math.random() * options.noise/2);

                    var dblHlp = 0;
                    for(var k=0; k<3; k++){
                        dblHlp = noise + imageData.data[i+k];
                        imageData.data[i+k] = ((dblHlp > 255)? 255 : ((dblHlp < 0)? 0 : dblHlp));
                    }
                }


            }

            if (options.viewFinder !== false) {
                var img = new Image();
                img.src = options.viewFinder;
                img.onload = function () {

                    var viewFinderCanvas = jQuery('<canvas></canvas>').get(0);
                    var viewFinderCtx = viewFinderCanvas.getContext('2d');

                    viewFinderCanvas.width = canvas.width;
                    viewFinderCanvas.height = canvas.height;

                    viewFinderCtx.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height);

                    var viewFinderImageData = viewFinderCtx.getImageData(0, 0, canvas.width, canvas.height);

                    for (var a = 0; a < imageData.data.length; a+=4) {

                        //red channel
                        var red = ( imageData.data[a  ] * viewFinderImageData.data[a  ]) / 255;
                        imageData.data[a  ] = red > 255 ? 255 : red < 0 ? 0 : red;

                        //green channel
                        var green = ( imageData.data[a+1] * viewFinderImageData.data[a+1]) / 255;
                        imageData.data[a+1] = green > 255 ? green : green < 0 ? 0 : green;

                        //blue channel
                        var blue = ( imageData.data[a+2] * viewFinderImageData.data[a+2]) / 255;
                        imageData.data[a+2] = blue > 255 ? 255 : blue < 0 ? 0 : blue;
                    }
                    //put manipulated image data
                    ctx.putImageData(imageData, 0, 0);
                    callback();
                };
            } else {
                //put manipulated image data
                ctx.putImageData(imageData, 0, 0);
                callback();
            }

        };


        /**
         * Run vintage effec
         */
        initVintage();

    });
};
