/**!
 * vintageJS
 * Add a retro/vintage effect to images using the HTML5 canvas element
 *
 * @license Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * @author Robert Fleischmann <rendro87@gmail.com>
 * @version 1.1.4
 **/
(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    }
    else if(typeof define === 'function' && define.amd) {
        define('vintagejs', ['jquery'], factory);
    }
    else {
        root['VintageJS'] = factory(root.jQuery);
    }
}(this, function($) {
var VintageJS = function(originalImage, opts, effect) {

  if (false === (originalImage instanceof HTMLImageElement)) {
    throw 'The element (1st parameter) must be an instance of HTMLImageElement';
  }

  var loadResources,
      applyEffect,
      vintage,
      resources,
      originalSrc,
      width,
      height,
      _effect,
      resourceName,
      image   = new Image(),
      tmpImg  = new Image(),
      canvas  = document.createElement('canvas'),
      ctx     = canvas.getContext('2d'),
      options = {
        onStart: function() {},
        onStop:  function() {},
        onError: function() {},
        mime:    'image/jpeg'
      },
      defaultEffect = {
        curves:     false,
        screen:     false,
        desaturate: false,
        vignette:   false,
        lighten:    false,
        noise:      false,
        viewFinder: false,
        sepia:      false,
        brightness: false,
        contrast:   false
      };

  image.onerror = options.onError;

  image.onload = function() {
    // set global variables
    width = canvas.width = image.width;
    height = canvas.height = image.height;

    // load resources
    loadResources();
  };

  tmpImg.onerror = options.onError;
  tmpImg.onload = function() {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tmpImg, 0, 0, width, height);
    (window.vjsImageCache || (window.vjsImageCache = {}))[resourceName] = ctx.getImageData(0, 0, width, height).data;
    loadResources();
  };

  applyEffect = function (effect) {
    options.onStart();

    // prepare effect options
    _effect = {};
    for(var name in defaultEffect) {
      _effect[name] = effect[name] || defaultEffect[name];
    }

    // define resources
    resources = [];
    if (!!_effect.viewFinder) {
      resources.push(_effect.viewFinder);
    }

    // load base image and trigger onload function
    if (image.src == originalSrc) {
      loadResources();
    } else {
      image.src = originalSrc;
    }
  };

  loadResources = function() {
    // call callback if all resources are loaded
    if (resources.length === 0) {
      return vintage();
    }

    // load next resource if the current one is already cached
    var resource     = resources.pop();
    resourceName = [width, height, resource].join('-');
    if (window.vjsImageCache && window.vjsImageCache[resourceName]) {
      return loadResources();
    }

    // load resource and put into cache
    tmpImg.src = resource;
  };

  vintage = function() {
    var outerRadius, gradient, imageData;

    // draw image on canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    // get gradient radius if vignette or lighten center are used
    if (!!_effect.vignette || !!_effect.lighten) {
      outerRadius = Math.sqrt( Math.pow(width / 2, 2) + Math.pow(height / 2, 2) );
    }

    // vignette
    if (!!_effect.vignette) {
      ctx.globalCompositeOperation = 'source-over';
      gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, outerRadius);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, ['rgba(0,0,0,', _effect.vignette, ')'].join('') );
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    if (!!_effect.lighten) {
      ctx.globalCompositeOperation = 'lighter';
      gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, outerRadius);
      gradient.addColorStop(0, ['rgba(255,255,255,', _effect.lighten, ')'].join('') );
      gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // get image data for pixel manipulation
    imageData  = ctx.getImageData(0, 0, width, height);

    // temporary var for faster looping
    var
    idx,
    j, // for check value loop
    r,g,b, // for sepia
    average,
    sepiatone,
    noise,
    _imageData = imageData.data,
    viewFinderImageData,
    contrastFactor;

    if (!!_effect.contrast) {
      contrastFactor = (259 * (_effect.contrast + 255)) / (255 * (259 - _effect.contrast));
    }

    if (!!_effect.viewFinder) {
      viewFinderImageData = window.vjsImageCache[ [width, height, _effect.viewFinder].join('-') ];
    }

    // loop backwards so the length has to be evaluated only once; --i is faster than ++i, i-- or i++
    for (var i = (width * height); i >= 0; --i) {
      // idx = i * 4;
      // bitshift operartions are faster
      idx = i << 2;

      // curves
      if (!!_effect.curves) {
        _imageData[idx  ] = _effect.curves.r[ _imageData[idx  ] ];
        _imageData[idx+1] = _effect.curves.g[ _imageData[idx+1] ];
        _imageData[idx+2] = _effect.curves.b[ _imageData[idx+2] ];
      }

      // contrast
      if (!!_effect.contrast) {
        _imageData[idx  ] = contrastFactor * (_imageData[idx  ] - 128) + 128;
        _imageData[idx+1] = contrastFactor * (_imageData[idx+1] - 128) + 128;
        _imageData[idx+2] = contrastFactor * (_imageData[idx+2] - 128) + 128;
      }

      // brightness
      if (!!_effect.brightness) {
        _imageData[idx  ] += _effect.brightness;
        _imageData[idx+1] += _effect.brightness;
        _imageData[idx+2] += _effect.brightness;
      }

      // screen
      if (!!_effect.screen) {
        _imageData[idx  ] = 255 - ((255 - _imageData[idx  ]) * (255 - _effect.screen.r * _effect.screen.a) / 255);
        _imageData[idx+1] = 255 - ((255 - _imageData[idx+1]) * (255 - _effect.screen.g * _effect.screen.a) / 255);
        _imageData[idx+2] = 255 - ((255 - _imageData[idx+2]) * (255 - _effect.screen.b * _effect.screen.a) / 255);
      }

      // noise
      if (!!_effect.noise) {
        noise = _effect.noise - Math.random() * _effect.noise / 2;
        _imageData[idx  ] += noise;
        _imageData[idx+1] += noise;
        _imageData[idx+2] += noise;
      }

      // view finder
      if (!!_effect.viewFinder) {
        _imageData[idx  ] = _imageData[idx  ] * viewFinderImageData[idx  ] / 255;
        _imageData[idx+1] = _imageData[idx+1] * viewFinderImageData[idx+1] / 255;
        _imageData[idx+2] = _imageData[idx+2] * viewFinderImageData[idx+2] / 255;
      }

      // sepia
      if (!!_effect.sepia) {
        r = _imageData[idx  ];
        g = _imageData[idx+1];
        b = _imageData[idx+2];
        _imageData[idx  ] = r * 0.393 + g * 0.769 + b * 0.189;
        _imageData[idx+1] = r * 0.349 + g * 0.686 + b * 0.168;
        _imageData[idx+2] = r * 0.272 + g * 0.534 + b * 0.131;
      }

      // desaturate
      if (!!_effect.desaturate) {
        average = ( _imageData[idx  ] + _imageData[idx+1] + _imageData[idx+2] ) / 3;
        _imageData[idx  ] += ((average - _imageData[idx  ]) * _effect.desaturate);
        _imageData[idx+1] += ((average - _imageData[idx+1]) * _effect.desaturate);
        _imageData[idx+2] += ((average - _imageData[idx+2]) * _effect.desaturate);
      }

      // check value range 0-255 and parse to int
      // http://jsperf.com/min-max-vs-if-else
      // http://jsperf.com/parseint-vs-double-bitwise-not2
      for (j=2; j>=0; --j) {
        _imageData[idx+j] = ~~(_imageData[idx+j] > 255 ? 255 : _imageData[idx+j] < 0 ? 0 : _imageData[idx+j]);
      }
    }

    // write image data, finalize vintageJS
    ctx.putImageData(imageData, 0, 0);
    originalImage.src = ctx.canvas.toDataURL(options.mime);
    options.onStop();
  };

  // initialize vintageJS library
  originalSrc = originalImage.src;
  opts = opts || {};
  for(var name in options) {
    options[name] = opts[name] || options[name];
  }
  if (effect) {
    applyEffect(effect);
  }

  return {
    apply: function() {
      originalSrc = originalImage.src;
    },
    reset: function() {
      originalImage.src = originalSrc;
    },
    vintage: applyEffect
  };
};

$.fn.vintage = function(options, effect) {
  return this.each(function() {
    if (!$.data(this, 'vintageJS')) {
      $.data(this, 'vintageJS', new VintageJS( this, options, effect ));
    }
  });
};

    return VintageJS;
}));
