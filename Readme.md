# vintageJS
Add a retro/vintage effect to images using the HTML5 canvas element.

## How to use

```javascript
// use an image as source
const srcEl = document.querySelector('img.myImage');
vintagejs(srcEl, { brightness: 0.2 })
  .then(
    result => {
      srcEl.src = result;
    },
    error => {
      console.log(`Failed: ${error}`);
    },
  );


// use a canvas as source
const srcEl = document.querySelector('canvas.myCanvas');
const ctx = srcEl.getContext('2d');
vintagejs(srcEl, { brightness: 0.2 })
  .then(
    result => {
      const img = new Image();
      img.src = result;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    },
    error => {
      console.log(`Failed: ${error}`);
    },
  );
```

## Effect options

Update effect documentation

```javascript
type RGBAColor = {
  r: number,
  g: number,
  b: number,
  a: number,
};
type Curve = {
  r: Array<number>,
  g: Array<number>,
  b: Array<number>,
};
type Effect = {
  curves: false | Curve,
  screen: false | RGBAColor,
  saturation: number,
  vignette: number,
  lighten: number,
  viewFinder: false | string,
  sepia: boolean,
  brightness: number,
  contrast: number,
};
```

## Browser support
Check support for the canvas element: [canisue.com/canvas](http://caniuse.com/canvas)

## Open Source License

vintageJS is dual licensed under the [MIT](http://www.opensource.org/licenses/mit-license.php) and [GPL](http://www.opensource.org/licenses/gpl-license.php) licenses.

## Changelog

### Version 1.1.5 - <small>May 16, 2016</small>
* Added "main" field to package.json

### Version 1.1.4 - <small>Oct 24, 2013</small>
* Added universal module definition (umd) wrapper

### Version 1.1.3 - <small>Nov 19, 2013</small>
* Added minified versions
* Fixed same-origin error

### Version 1.1.2 - <small>Jul 24, 2013</small>
* added AngularJS support thanks to [@dpiccone](https://github.com/dpiccone)
* grunt based build script for all versions

### Version 1.1.1 - <small>May 20, 2013</small>
* performance improvements
* new effect options:
    * brightness
    * contrast

### Version 1.1.0 - <small>May 19, 2013</small>
* New and faster core

### Version 1.0.0 - <small>Mar 17, 2011</small>
* Initial release
