(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _index = require('../src/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var img = document.getElementById('picture');
var resultImg = document.createElement('img');
img.parentElement.appendChild(resultImg);

var compose = function compose(f, g) {
  return function (x) {
    return f(g(x));
  };
};
var idArr = new Array(256).fill(1).map(function (_, i) {
  return i;
});
var rgb = function rgb(c) {
  return -12 * Math.sin(c * 2 * Math.PI / 255) + c;
};
var r = function r(c) {
  return -0.2 * Math.sqrt(255 * c) * Math.sin(Math.PI * (-0.0000195 * c * c + 0.0125 * c)) + c;
};
var g = function g(c) {
  return -0.001045244139166791 * c * c + 1.2665372554875318 * c;
};
var b = function b(c) {
  return 0.57254902 * c + 53;
};

var curves = {
  r: idArr.map(compose(r, rgb)),
  g: idArr.map(compose(g, rgb)),
  b: idArr.map(compose(b, rgb))
};

(0, _index2.default)(img, {
  vignette: 0.3,
  lighten: 0.2,
  brightness: -0.1,
  contrast: 0.15,
  curves: curves,
  screen: {
    r: 227,
    g: 12,
    b: 169,
    a: 0.15
  }
}).then(function (dataUri) {
  resultImg.src = dataUri;
}, function (err) {
  console.error(err);
});

},{"../src/index.js":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {value: true});

exports.default = function nullthrows(x) {
  if (x != null) {
    return x;
  }
  throw new Error('Got unexpected null or undefined');
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultEffect = {
  curves: false,
  screen: false,
  saturation: 1,
  vignette: 0,
  lighten: 0,
  viewFinder: false,
  sepia: false,
  brightness: 0,
  contrast: 0
};

var IMAGE_TYPE = 'image/jpeg';
var IMAGE_QUALITY = 1;

var readSourceFromCanvas = function readSourceFromCanvas(el) {
  return el.toDataURL(IMAGE_TYPE, IMAGE_QUALITY);
};

var readSourceFromImage = function readSourceFromImage(el) {
  var canvas = document.createElement('canvas');
  canvas.width = el.width;
  canvas.height = el.height;
  var ctx = (0, _nullthrows2.default)(canvas.getContext('2d'), 'Could not get 2d context for canvas');
  ctx.drawImage(el, 0, 0, el.width, el.height);

  return readSourceFromCanvas(canvas);
};

var readSource = function readSource(el) {
  if (el instanceof HTMLImageElement) {
    return readSourceFromImage(el);
  }
  if (el instanceof HTMLCanvasElement) {
    return readSourceFromCanvas(el);
  }
  throw new Error('Unsupported source element. Expected HTMLCanvasElement or HTMLImageElement, got ' + (typeof el === 'undefined' ? 'undefined' : _typeof(el)) + '.');
};

// cool when used as contrast
// const contrastFn = _ =>
//   c => 259 * (c + 255) / (255 * (259 - c)) * (c - 128) + 128;

var compose = function compose(f, g) {
  return function (x) {
    return f(g(x));
  };
};

var idFn = function idFn(c) {
  return c;
};
var curvesFn = function curvesFn(curves) {
  return function (c) {
    return curves[c];
  };
};
var contrastFn = function contrastFn(f) {
  return function (c) {
    return 259 * (f * 256 + 255) / (255 * (259 - f * 256)) * (c - 128) + 128;
  };
};
var brightnessFn = function brightnessFn(f) {
  return function (c) {
    return c + f * 256;
  };
};
var screenFn = function screenFn(sa) {
  return function (sc) {
    return function (c) {
      return 255 - (255 - c) * (255 - sc * sa) / 255;
    };
  };
};

// _imageData[idx  ] += ((average - _imageData[idx  ]) * _effect.desaturate);
var getLUT = function getLUT(effect) {
  var curves = effect.curves,
      contrast = effect.contrast,
      brightness = effect.brightness,
      screen = effect.screen,
      sepia = effect.sepia,
      saturation = effect.saturation;

  var rMod = idFn;
  var gMod = idFn;
  var bMod = idFn;

  if (curves) {
    rMod = compose(curvesFn(curves.r), rMod);
    gMod = compose(curvesFn(curves.g), gMod);
    bMod = compose(curvesFn(curves.b), bMod);
  }

  if (contrast) {
    var f = contrastFn(contrast);
    rMod = compose(f, rMod);
    gMod = compose(f, gMod);
    bMod = compose(f, bMod);
  }

  if (brightness) {
    var _f = brightnessFn(brightness);
    rMod = compose(_f, rMod);
    gMod = compose(_f, gMod);
    bMod = compose(_f, bMod);
  }

  if (screen) {
    var _f2 = screenFn(screen.a);
    rMod = compose(_f2(screen.r), rMod);
    gMod = compose(_f2(screen.g), gMod);
    bMod = compose(_f2(screen.b), bMod);
  }

  var id_arr = new Array(256).fill(1).map(function (_, idx) {
    return idx;
  });
  return [id_arr.map(rMod), id_arr.map(gMod), id_arr.map(bMod), id_arr.slice(0)];
};

// const getVignette = (): string => {
//   const { width, height } = canvas;
//   ctx.clearRect(0, 0, width, height);
//   // ctx.globalCompositeOperation = 'multiply';
// };

// ApplyEffect :: SourceElement -> $Shape<Effect> -> Promise<string>

exports.default = function (srcEl, partialEffect) {
  return new Promise(function (resolve, reject) {
    console.time('effect');
    var effect = _extends({}, defaultEffect, partialEffect);
    var LUT = getLUT(effect);
    var imageData = readSource(srcEl);
    var canvas = document.createElement('canvas');
    var width = srcEl.width,
        height = srcEl.height;

    canvas.width = width;
    canvas.height = height;
    var ctx = (0, _nullthrows2.default)(canvas.getContext('2d'), 'Could not get 2d context for canvas');
    ctx.drawImage(srcEl, 0, 0, canvas.width, canvas.height);
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data.data.set(data.data.map(function (v, i) {
      return LUT[i % 4][v];
    }));
    ctx.putImageData(data, 0, 0);

    if (effect.vignette) {
      ctx.globalCompositeOperation = 'multiply';
      if (ctx.globalCompositeOperation !== 'multiply') {
        console.log('globalCompositeOperation fallback');
        ctx.globalCompositeOperation = 'source-over';
      }
      var gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)));
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,' + effect.vignette + ')');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    if (effect.lighten) {
      ctx.globalCompositeOperation = 'lighter';
      var _gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)));
      _gradient.addColorStop(0, 'rgba(255,255,255,' + effect.lighten + ')');
      _gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
      _gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = _gradient;
      ctx.fillRect(0, 0, width, height);
    }
    var res = canvas.toDataURL(IMAGE_TYPE, IMAGE_QUALITY);
    console.timeEnd('effect');
    resolve(res);
  });
};

},{"nullthrows":2}]},{},[1]);
