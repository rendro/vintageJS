'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils.js');

var defaultEffect = {
  curves: false,
  screen: false,
  saturation: 1,
  vignette: 0,
  lighten: 0,
  viewfinder: false,
  sepia: false,
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

  var id_arr = new Array(256).fill(1).map(function (_, idx) {
    return idx;
  });
  return [id_arr.map(rMod), id_arr.map(gMod), id_arr.map(bMod)];
};

// ApplyEffect :: SourceElement -> $Shape<Effect> -> Promise<string>

exports.default = function (srcEl, partialEffect) {
  return new Promise(function (resolve, reject) {
    var effect = _extends({}, defaultEffect, partialEffect);
    var LUT = getLUT(effect);

    var _getCanvasAndCtx = (0, _utils.getCanvasAndCtx)(srcEl),
        _getCanvasAndCtx2 = _slicedToArray(_getCanvasAndCtx, 2),
        canvas = _getCanvasAndCtx2[0],
        ctx = _getCanvasAndCtx2[1];

    var width = canvas.width,
        height = canvas.height;

    ctx.globalCompositeOperation = 'multiply';
    var supportsBlendModes = ctx.globalCompositeOperation === 'multiply';
    var data = ctx.getImageData(0, 0, width, height);
    var id = data.data.slice(0);
    var sepia = effect.sepia,
        saturation = effect.saturation,
        viewfinder = effect.viewfinder;


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
        var _r = r * 0.393 + g * 0.769 + b * 0.189;
        var _g = r * 0.349 + g * 0.686 + b * 0.168;
        var _b = r * 0.272 + g * 0.534 + b * 0.131;
        r = _r;
        g = _g;
        b = _b;
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

    if (!viewfinder) {
      resolve((0, _utils.getResult)(canvas));
    } else {
      return (0, _utils.loadImageWithCache)(viewfinder).then(function (img) {
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
        resolve((0, _utils.getResult)(canvas));
      });
    }
  });
};
