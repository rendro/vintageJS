(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.vintagejs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {value: true});

exports.default = function nullthrows(x) {
  if (x != null) {
    return x;
  }
  throw new Error('Got unexpected null or undefined');
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _utils = require('./utils.js');

var defaultEffect = {
  curves: false,
  screen: false,
  saturation: 1,
  vignette: 0,
  lighten: 0,
  viewfinder: false,
  sepia: false,
  gray: false,
  brightness: 0,
  contrast: 0
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

var getLUT = function getLUT(effect) {
  var curves = effect.curves,
      contrast = effect.contrast,
      brightness = effect.brightness,
      screen = effect.screen,
      saturation = effect.saturation;

  var rMod = idFn;
  var gMod = idFn;
  var bMod = idFn;

  if (curves) {
    rMod = (0, _utils.compose)(curvesFn(curves.r), rMod);
    gMod = (0, _utils.compose)(curvesFn(curves.g), gMod);
    bMod = (0, _utils.compose)(curvesFn(curves.b), bMod);
  }

  if (contrast) {
    var f = contrastFn(contrast);
    rMod = (0, _utils.compose)(f, rMod);
    gMod = (0, _utils.compose)(f, gMod);
    bMod = (0, _utils.compose)(f, bMod);
  }

  if (brightness) {
    var _f = brightnessFn(brightness);
    rMod = (0, _utils.compose)(_f, rMod);
    gMod = (0, _utils.compose)(_f, gMod);
    bMod = (0, _utils.compose)(_f, bMod);
  }

  if (screen) {
    var _f2 = screenFn(screen.a);
    rMod = (0, _utils.compose)(_f2(screen.r), rMod);
    gMod = (0, _utils.compose)(_f2(screen.g), gMod);
    bMod = (0, _utils.compose)(_f2(screen.b), bMod);
  }
  var idArr = (Uint8ClampedArray ? new Uint8ClampedArray(256) : new Array(256).fill(1)).map(function (_, idx) {
    return idx;
  });
  return [idArr.map(rMod), idArr.map(gMod), idArr.map(bMod)];
};

var applyEffect = function applyEffect(effect) {
  var LUT = getLUT(effect);
  return function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        canvas = _ref2[0],
        ctx = _ref2[1];

    return new Promise(function (resolve, reject) {
      var width = canvas.width,
          height = canvas.height;

      ctx.globalCompositeOperation = 'multiply';
      var supportsBlendModes = ctx.globalCompositeOperation === 'multiply';
      var data = ctx.getImageData(0, 0, width, height);
      var id = data.data.slice(0);
      var sepia = effect.sepia,
          saturation = effect.saturation,
          gray = effect.gray;


      for (var i = id.length / 4; i >= 0; --i) {
        var ri = i << 2;
        var gi = ri + 1;
        var bi = ri + 2;

        var r = LUT[0][id[ri]];
        var g = LUT[1][id[gi]];
        var b = LUT[2][id[bi]];

        if (sepia) {
          var _ref3 = [r * 0.393 + g * 0.769 + b * 0.189, r * 0.349 + g * 0.686 + b * 0.168, r * 0.272 + g * 0.534 + b * 0.131];
          r = _ref3[0];
          g = _ref3[1];
          b = _ref3[2];
        }

        if (gray) {
          var _ref4 = [r * 0.21 + g * 0.72 + b * 0.07, r * 0.21 + g * 0.72 + b * 0.07, r * 0.21 + g * 0.72 + b * 0.07];
          r = _ref4[0];
          g = _ref4[1];
          b = _ref4[2];
        }

        if (saturation < 1) {
          var avg = (r + g + b) / 3;
          r += (avg - r) * (1 - saturation);
          g += (avg - g) * (1 - saturation);
          b += (avg - b) * (1 - saturation);
        }

        id[ri] = r;
        id[gi] = g;
        id[bi] = b;
      }

      data.data.set(id);
      ctx.putImageData(data, 0, 0);

      if (effect.vignette) {
        ctx.globalCompositeOperation = supportsBlendModes ? 'multiply' : 'source-over';
        ctx.fillStyle = (0, _utils.getGradient)(ctx, width, height, ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,' + effect.vignette + ')']);
        ctx.fillRect(0, 0, width, height);
      }

      if (effect.lighten) {
        ctx.globalCompositeOperation = supportsBlendModes ? 'screen' : 'lighter';
        ctx.fillStyle = (0, _utils.getGradient)(ctx, width, height, ['rgba(255,255,255,' + effect.lighten + ')', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)']);
        ctx.fillRect(0, 0, width, height);
      }

      if (!effect.viewfinder) {
        return resolve((0, _utils.getResult)(canvas));
      }

      return (0, _utils.loadImageWithCache)(effect.viewfinder).then(function (img) {
        if (supportsBlendModes) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          var _createCanvasAndCtxFr = (0, _utils.createCanvasAndCtxFromImage)(img, width, height),
              _createCanvasAndCtxFr2 = _slicedToArray(_createCanvasAndCtxFr, 2),
              _ = _createCanvasAndCtxFr2[0],
              vfCtx = _createCanvasAndCtxFr2[1];

          var _vfCtx$getImageData = vfCtx.getImageData(0, 0, width, height),
              vfData = _vfCtx$getImageData.data;

          var imageData = ctx.getImageData(0, 0, width, height);
          imageData.data.set(imageData.data.map(function (v, i) {
            return v * vfData[i] / 255;
          }));
          ctx.putImageData(imageData, 0, 0);
        }

        return resolve((0, _utils.getResult)(canvas));
      });
    });
  };
};

// vintagejs :: TSource -> $Shape<TEffect> -> Promise<TResult>

exports.default = function (src, partialEffect) {
  var genSource = typeof src === 'string' ? (0, _utils.loadImage)(src).then(_utils.getCanvasAndCtx) : Promise.resolve((0, _utils.getCanvasAndCtx)(src));

  return genSource.then(applyEffect(_extends({}, defaultEffect, partialEffect)));
};

module.exports = exports['default'];

},{"./utils.js":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResult = exports.loadImageWithCache = exports.loadImage = exports.getGradient = exports.getCanvasAndCtx = exports.cloneCanvasAndCtx = exports.createCanvasAndCtxFromImage = exports.compose = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IMAGE_TYPE = 'image/jpeg';
var IMAGE_QUALITY = 1;

var compose = exports.compose = function compose(f, g) {
  return function (x) {
    return f(g(x));
  };
};

var createCanvasAndCtxFromImage = exports.createCanvasAndCtxFromImage = function createCanvasAndCtxFromImage(el, width, height) {
  var canvas = document.createElement('canvas');
  if (!width) width = el.width;
  if (!height) height = el.height;
  canvas.width = width;
  canvas.height = height;
  var ctx = (0, _nullthrows2.default)(canvas.getContext('2d'), 'Could not get 2d context for canvas');
  ctx.drawImage(el, 0, 0, width, height);

  return [canvas, ctx];
};

var cloneCanvasAndCtx = exports.cloneCanvasAndCtx = function cloneCanvasAndCtx(source) {
  var width = source.width,
      height = source.height;

  var target = document.createElement('canvas');
  var targetCtx = (0, _nullthrows2.default)(target.getContext('2d'), 'Could not get 2d context for canvas');
  target.width = width;
  target.height = height;
  targetCtx.drawImage(source, 0, 0, width, height);

  return [target, targetCtx];
};

var getCanvasAndCtx = exports.getCanvasAndCtx = function getCanvasAndCtx(el) {
  if (el instanceof HTMLImageElement) {
    return createCanvasAndCtxFromImage(el);
  }
  if (el instanceof HTMLCanvasElement) {
    return cloneCanvasAndCtx(el);
  }
  throw new Error('Unsupported source element. Expected HTMLCanvasElement or HTMLImageElement, got ' + (typeof el === 'undefined' ? 'undefined' : _typeof(el)) + '.');
};

var getGradient = exports.getGradient = function getGradient(ctx, width, height, colorSteps) {
  var gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)));
  colorSteps.forEach(function (color, idx, steps) {
    gradient.addColorStop(idx / (steps.length - 1), color);
  });
  return gradient;
};

var loadImage = exports.loadImage = function loadImage(src) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = function () {
      return resolve(img);
    };
    img.crossOrigin = 'anonymous';
    img.onerror = function (err) {
      return reject(err);
    };
    img.src = src;
  });
};

var loadImageWithCache = exports.loadImageWithCache = function () {
  var cache = {};
  return function (src) {
    return cache[src] ? Promise.resolve(cache[src]) : loadImage(src).then(function (img) {
      cache[src] = img;
      return img;
    });
  };
}();

var getResult = exports.getResult = function getResult(canvas) {
  return {
    getDataURL: function getDataURL() {
      var mimeType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : IMAGE_TYPE;
      var quality = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : IMAGE_QUALITY;

      return canvas.toDataURL(mimeType, quality);
    },
    getCanvas: function getCanvas() {
      return canvas;
    },
    genImage: function genImage() {
      var mimeType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : IMAGE_TYPE;
      var quality = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : IMAGE_QUALITY;

      return loadImage(canvas.toDataURL(mimeType, quality));
    }
  };
};

},{"nullthrows":1}]},{},[2])(2)
});