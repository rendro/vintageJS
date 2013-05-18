var vintageJS = function(originalImage, opts, effect) {
  if (false === (originalImage instanceof HTMLImageElement)) {
    throw 'The element (1st parameter) must be an instance of HTMLImageElement';
  }

  var loadResources,
      applyEffect,
      vintage,
      resources,
      image,
      originalSrc,
      width,
      height,
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
        viewFinder: false
      };

  applyEffect = function (effect) {
    options.onStart();

    // prepare effect options
    var _effect = {};
    for(var name in defaultEffect) {
      _effect[name] = effect[name] || defaultEffect[name];
    }

    // load base image and
    image = new Image();
    image.onload = function() {
      // set global variables
      width = canvas.width = image.width;
      height = canvas.height = image.height;

      // define resources
      resources = [];
      if (!!_effect.viewFinder) {
        resources.push(_effect.viewFinder);
      }

      // load resources
      loadResources(function() {
        // calculate the effect
        vintage(_effect);
      });
    };
    image.onerror = options.onError;
    image.src = originalSrc;
  };

  loadResources = function(cb) {
    // call callback if all resources are loaded
    if (resources.length === 0) {
      return cb();
    }

    // load next resource if the current one is already cached
    var resource     = resources.pop(),
        resourceName = [width, height, resource].join('-');
    if (window.vjsImageCache && window.vjsImageCache[resourceName]) {
      return loadResources(cb);
    }

    // load resource and put into cache
    var tmpImg    = new Image();
    tmpImg.onload = function() {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(tmpImg, 0, 0, width, height);
      (window.vjsImageCache || (window.vjsImageCache = {}))[resourceName] = ctx.getImageData(0, 0, width, height).data;
      loadResources(cb);
    };
    tmpImg.onerror = options.onError;
    tmpImg.src = resource;
  };

  vintage = function(effect) {
    var outerRadius, gradient, imageData;

    // draw image on canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    // get gradient radius if vignette or lighten center are used
    if (!!effect.vignette || !!effect.lighten) {
      outerRadius = Math.sqrt( Math.pow(width / 2, 2) + Math.pow(height / 2, 2) );
    }

    // vignette
    if (!!effect.vignette) {
      ctx.globalCompositeOperation = 'source-over';
      gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, outerRadius);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, ['rgba(0,0,0,', effect.vignette, ')'].join('') );
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    if (!!effect.lighten) {
      ctx.globalCompositeOperation = 'lighter';
      gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, outerRadius);
      gradient.addColorStop(0, ['rgba(255,255,255,', effect.lighten, ')'].join('') );
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
    average,
    noise,
    _imageData = imageData.data;

    if (!!effect.viewFinder) {
      viewFinderImageData = window.vjsImageCache[ [width, height, effect.viewFinder].join('-') ];
    }

    // loop backwards so the length has to be evaluated only once; --i is faster than ++i, i-- or i++
    for (var i = (width * height); i >= 0; --i) {
      // idx = i * 4;
      // bitshift operartions are faster
      idx = i << 2;

      // curves
      if (!!effect.curves) {
        _imageData[idx  ] = effect.curves.r[ _imageData[idx  ] ];
        _imageData[idx+1] = effect.curves.g[ _imageData[idx+1] ];
        _imageData[idx+2] = effect.curves.b[ _imageData[idx+2] ];
      }

      // screen
      if (!!effect.screen && !!effect.screen.r && !!effect.screen.g && !!effect.screen.b && !!effect.screen.a) {
        _imageData[idx  ] = 255 - ((255 - _imageData[idx  ]) * (255 - effect.screen.r * effect.screen.a) / 255);
        _imageData[idx+1] = 255 - ((255 - _imageData[idx+1]) * (255 - effect.screen.g * effect.screen.a) / 255);
        _imageData[idx+2] = 255 - ((255 - _imageData[idx+2]) * (255 - effect.screen.b * effect.screen.a) / 255);
      }

      // noise
      if (!!effect.noise) {
        noise = effect.noise - Math.random() * effect.noise / 2;
        _imageData[idx  ] += noise;
        _imageData[idx+1] += noise;
        _imageData[idx+2] += noise;
      }

      // view finder
      if (!!effect.viewFinder) {
        _imageData[idx  ] = _imageData[idx  ] * viewFinderImageData[idx  ] / 255;
        _imageData[idx+1] = _imageData[idx+1] * viewFinderImageData[idx+1] / 255;
        _imageData[idx+2] = _imageData[idx+2] * viewFinderImageData[idx+2] / 255;
      }

      // desaturate
      if (!!effect.desaturate) {
        average = ( _imageData[idx  ] + _imageData[idx+1] + _imageData[idx+2] ) / 3;
        _imageData[idx  ] += ((average - _imageData[idx  ]) * effect.desaturate);
        _imageData[idx+1] += ((average - _imageData[idx+1]) * effect.desaturate);
        _imageData[idx+2] += ((average - _imageData[idx+2]) * effect.desaturate);
      }

      // check value range 0-255 and parse to int
      // http://jsperf.com/min-max-vs-if-else
      // http://jsperf.com/parseint-vs-double-bitwise-not2
      for (j=2; j>=0; --j) {
        _imageData[idx+j] = ~~(_imageData[idx+j] > 255 ? 255 : _imageData[idx+j] < 0 ? 0 : _imageData[idx+j]);
      }

      // if (i <= 0) {

      // }
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
    vintage: applyEffect
  };
};
