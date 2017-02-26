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

var createCanvasFromImage = function createCanvasFromImage(el) {
  var canvas = document.createElement('canvas');
  canvas.width = el.width;
  canvas.height = el.height;
  var ctx = (0, _nullthrows2.default)(canvas.getContext('2d'), 'Could not get 2d context for canvas');
  ctx.drawImage(el, 0, 0, el.width, el.height);

  return canvas;
};

var getCanvas = function getCanvas(el) {
  if (el instanceof HTMLImageElement) {
    return createCanvasFromImage(el);
  }
  if (el instanceof HTMLCanvasElement) {
    return el;
  }
  throw new Error('Unsupported source element. Expected HTMLCanvasElement or HTMLImageElement, got ' + (typeof el === 'undefined' ? 'undefined' : _typeof(el)) + '.');
};

var getGradient = function getGradient(ctx, width, height, colorSteps) {
  var gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)));
  colorSteps.forEach(function (color, idx, steps) {
    gradient.addColorStop(idx / (steps.length - 1), color);
  });
  return gradient;
};
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
  return [id_arr.map(rMod), id_arr.map(gMod), id_arr.map(bMod)];
};

// ApplyEffect :: SourceElement -> $Shape<Effect> -> Promise<string>

exports.default = function (srcEl, partialEffect) {
  return new Promise(function (resolve, reject) {
    console.time('effect');
    var effect = _extends({}, defaultEffect, partialEffect);
    var LUT = getLUT(effect);
    var canvas = getCanvas(srcEl);
    var width = canvas.width,
        height = canvas.height;

    var ctx = (0, _nullthrows2.default)(canvas.getContext('2d'), 'Could not get 2d context for canvas');

    var data = ctx.getImageData(0, 0, width, height);
    var id = data.data.slice(0);
    var sepia = effect.sepia,
        saturation = effect.saturation;


    var r = void 0,
        g = void 0,
        b = void 0,
        ri = void 0,
        gi = void 0,
        bi = void 0;
    for (var i = id.length / 4; i >= 0; --i) {
      ri = i << 2;
      gi = ri + 1;
      bi = ri + 2;

      r = LUT[0][id[ri]];
      g = LUT[1][id[gi]];
      b = LUT[2][id[bi]];

      if (sepia) {
        r = r * 0.393 + g * 0.769 + b * 0.189;
        g = r * 0.349 + g * 0.686 + b * 0.168;
        b = r * 0.272 + g * 0.534 + b * 0.131;
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
      ctx.globalCompositeOperation = 'multiply';
      if (ctx.globalCompositeOperation !== 'multiply') {
        console.log('globalCompositeOperation fallback');
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = getGradient(ctx, width, height, ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,' + effect.vignette + ')']);
      ctx.fillRect(0, 0, width, height);
    }

    if (effect.lighten) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = getGradient(ctx, width, height, ['rgba(255,255,255,' + effect.lighten + ')', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)']);
      ctx.fillRect(0, 0, width, height);
    }
    var res = canvas.toDataURL(IMAGE_TYPE, IMAGE_QUALITY);
    console.timeEnd('effect');
    resolve(res);
  });
};
