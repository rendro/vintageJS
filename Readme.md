# vintageJS

> Add a retro/vintage effect to images using the HTML5 canvas element.

[![npm](https://img.shields.io/npm/v/vintagejs.svg?style=flat-square)]()
[![npm](https://img.shields.io/npm/l/vintagejs.svg?style=flat-square)]()
[![Greenkeeper badge](https://badges.greenkeeper.io/rendro/vintageJS.svg)](https://greenkeeper.io/)

![](header.jpg)

## Installation

```
$ npm install vintagejs
```

## How to use

`vintagejs` is a function that takes a source (URL, ImageElement or CanvasElement) and an effect (object with all the options) and returns a Promise that resolves to a result object.

```javascript
vintagejs('./path/to/picture.jpg', { brightness: 0.2 })
  .then(res => res.genImage())
  .then(img => document.body.appendChild(img));
```

The result object provides the following methods to access the modified image data:

```javascript
// returns the data url of the updated image. Use it to update the source of an existing image
getDataURL(mimeType?: string, quality?: number): string;
// returns the canvas with the updated image. Use it to draw your changes onto another canvas
getCanvas(): HTMLCanvasElement;
// returns a promise that resolves to an HTMLImageElement of the updated image
genImage(mimeType?: string, quality?: number): Promise<HTMLImageElement>;
```

If not provided, mimeType defaults to `image/jpeg` and quality defaults to `1`.

### More Examples

```javascript
// use an image as source and update image with data url
const srcEl = document.querySelector('img.myImage');
vintagejs(srcEl, { brightness: 0.2 })
  .then(res => {
    srcEl.src = res.getDataURL();
  });

// use a canvas as source and draw result to canvas
const srcEl = document.querySelector('canvas.myCanvas');
const ctx = srcEl.getContext('2d');
vintagejs(srcEl, { brightness: 0.2 })
  .then(res => {
    ctx.drawImage(res.getCanvas(), 0, 0, srcEl.width, srcEl.height);
  });
```

## Effect options

```javascript
type TEffect = {
  curves: false | TCurve,     // default: false
  screen: false | TRGBAColor, // default: false
  saturation: number,         // float between 0 and 1, default: 1
  vignette: number,           // float between 0 and 1, default: 0
  lighten: number,            // float between 0 and 1, default: 0
  viewfinder: false | string, // string must be URL, default: false
  sepia: boolean,             // default: false
  gray: boolean,              // default: false
  brightness: number,         // float between -1 and 1, default: 0
  contrast: number,           // float between -1 and 1, default: 0
};

// every channel, r=red, g=green, b=blue serves as a look up table for color mappings
type TCurve = {
  r: Array<Uint8> | Uint8ClampedArray, // array of int between 0 and 255, length of array === 256
  g: Array<Uint8> | Uint8ClampedArray, // array of int between 0 and 255, length of array === 256
  b: Array<Uint8> | Uint8ClampedArray, // array of int between 0 and 255, length of array === 256
};

type TRGBAColor = {
  r: Uint8,  // int between 0 and 255
  g: Uint8,  // int between 0 and 255
  b: Uint8,  // int between 0 and 255
  a: number, // float between 0 and 1
};
```

### Examples

```javascript
const noEffect = {};

const effect_1 = {
  brightness: -0.2,
  contrast: 0.15,
};

const effect_2 = {
  brightness: 0.1,
  vignette: 0.3,
  viewfinder: './film-1.jpg',
  screen: {
    r: 227,
    g: 12,
    b: 169,
    a: 0.15,
  },
};
```

See examples folder for more examples.

## Browser support
Check support for the canvas element [canisue.com/canvas](http://caniuse.com/canvas).

Higher performance when canvas blend modes are supported [caniuse.com/#feat=canvas-blending](http://caniuse.com/#feat=canvas-blending), but fallbacks are implemented.

## License

[MIT](http://www.opensource.org/licenses/mit-license.php)

## Changelog

### 2.2.0
* Added true grayscale effect (Thanks @bjornbos for PR #38)

### 2.1.0
* Add support for strings (URI or base64 encoded data-uri) as a source

### 2.0.0
* Rewrite from ground up
* Functional API

### 1.1.5
* Added "main" field to package.json

### 1.1.4
* Added universal module definition (umd) wrapper

### 1.1.3
* Added minified versions
* Fixed same-origin error

### 1.1.2
* added AngularJS support thanks to [@dpiccone](https://github.com/dpiccone)
* grunt based build script for all versions

### 1.1.1
* performance improvements
* new effect options:
    * brightness
    * contrast

### 1.1.0
* Improved core performance

### 1.0.0
* Initial release
