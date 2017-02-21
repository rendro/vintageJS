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
  noise: 0,
  viewFinder: false,
  sepia: false,
  brightness: 0,
  contrast: 0
};

var IMAGE_TYPE = 'image/jpeg';
var IMAGE_QUALITY = 1;

var readSourceFromCanvas = function readSourceFromCanvas(el) {
  return Promise.resolve(el.toDataURL(IMAGE_TYPE, IMAGE_QUALITY));
};

var readSourceFromImage = function readSourceFromImage(el) {
  return new Promise(function (resolve, reject) {
    var image = new Image();
    image.onload = function (x) {
      console.log(x);
    };
    image.onerror = function (x) {
      console.log(x);
    };
  });
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

// ApplyEffect :: SourceElement -> $Shape<Effect> -> Promise<string>

exports.default = function (srcEl, partialEffect) {
  return new Promise(function (resolve, reject) {
    var effect = _extends({}, defaultEffect, partialEffect);
    var imageData = readSource(srcEl);
    resolve('result');
  });
};
