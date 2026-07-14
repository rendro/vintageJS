(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.vintagejs = factory());
})(this, (function() {
  "use strict";
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var nullthrows$1 = { exports: {} };
  var hasRequiredNullthrows;
  function requireNullthrows() {
    if (hasRequiredNullthrows) return nullthrows$1.exports;
    hasRequiredNullthrows = 1;
    function nullthrows2(x, message) {
      if (x != null) {
        return x;
      }
      var error = new Error(message !== void 0 ? message : "Got unexpected " + x);
      error.framesToPop = 1;
      throw error;
    }
    nullthrows$1.exports = nullthrows2;
    nullthrows$1.exports.default = nullthrows2;
    Object.defineProperty(nullthrows$1.exports, "__esModule", { value: true });
    return nullthrows$1.exports;
  }
  var nullthrowsExports = requireNullthrows();
  const nullthrows = /* @__PURE__ */ getDefaultExportFromCjs(nullthrowsExports);
  const IMAGE_TYPE = "image/jpeg";
  const IMAGE_QUALITY = 1;
  const compose = (f, g) => (x) => f(g(x));
  const createCanvasAndCtxFromImage = (el, width, height) => {
    const canvas = document.createElement("canvas");
    if (!width) width = el.width;
    if (!height) height = el.height;
    canvas.width = width;
    canvas.height = height;
    const ctx = nullthrows(
      canvas.getContext("2d"),
      "Could not get 2d context for canvas"
    );
    ctx.drawImage(el, 0, 0, width, height);
    return [canvas, ctx];
  };
  const cloneCanvasAndCtx = (source) => {
    const { width, height } = source;
    const target = document.createElement("canvas");
    const targetCtx = nullthrows(
      target.getContext("2d"),
      "Could not get 2d context for canvas"
    );
    target.width = width;
    target.height = height;
    targetCtx.drawImage(source, 0, 0, width, height);
    return [target, targetCtx];
  };
  const getCanvasAndCtx = (el) => {
    if (el instanceof HTMLImageElement) {
      return createCanvasAndCtxFromImage(el);
    }
    if (el instanceof HTMLCanvasElement) {
      return cloneCanvasAndCtx(el);
    }
    throw new Error(
      `Unsupported source element. Expected HTMLCanvasElement or HTMLImageElement, got ${typeof el}.`
    );
  };
  const getGradient = (ctx, width, height, colorSteps) => {
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2))
    );
    colorSteps.forEach((color, idx, steps) => {
      gradient.addColorStop(idx / (steps.length - 1), color);
    });
    return gradient;
  };
  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.crossOrigin = "anonymous";
    img.onerror = (err) => reject(err);
    img.src = src;
  });
  const loadImageWithCache = /* @__PURE__ */ (() => {
    const cache = {};
    return (src) => cache[src] ? Promise.resolve(cache[src]) : loadImage(src).then((img) => {
      cache[src] = img;
      return img;
    });
  })();
  const getResult = (canvas) => ({
    getDataURL(mimeType = IMAGE_TYPE, quality = IMAGE_QUALITY) {
      return canvas.toDataURL(mimeType, quality);
    },
    getCanvas() {
      return canvas;
    },
    genImage(mimeType = IMAGE_TYPE, quality = IMAGE_QUALITY) {
      return loadImage(canvas.toDataURL(mimeType, quality));
    }
  });
  const defaultEffect = {
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
  const idFn = (c) => c;
  const curvesFn = (curves) => (c) => curves[c];
  const contrastFn = (f) => (c) => 259 * (f * 256 + 255) / (255 * (259 - f * 256)) * (c - 128) + 128;
  const brightnessFn = (f) => (c) => c + f * 256;
  const screenFn = (sa) => (sc) => (c) => 255 - (255 - c) * (255 - sc * sa) / 255;
  const getLUT = (effect) => {
    const { curves, contrast, brightness, screen } = effect;
    let rMod = idFn;
    let gMod = idFn;
    let bMod = idFn;
    if (curves) {
      rMod = compose(curvesFn(curves.r), rMod);
      gMod = compose(curvesFn(curves.g), gMod);
      bMod = compose(curvesFn(curves.b), bMod);
    }
    if (contrast) {
      let f = contrastFn(contrast);
      rMod = compose(f, rMod);
      gMod = compose(f, gMod);
      bMod = compose(f, bMod);
    }
    if (brightness) {
      let f = brightnessFn(brightness);
      rMod = compose(f, rMod);
      gMod = compose(f, gMod);
      bMod = compose(f, bMod);
    }
    if (screen) {
      let f = screenFn(screen.a);
      rMod = compose(f(screen.r), rMod);
      gMod = compose(f(screen.g), gMod);
      bMod = compose(f(screen.b), bMod);
    }
    const idArr = new Uint8ClampedArray(256).map((_, idx) => idx);
    return [idArr.map(rMod), idArr.map(gMod), idArr.map(bMod)];
  };
  const applyEffect = (effect) => {
    const LUT = getLUT(effect);
    return ([canvas, ctx]) => new Promise((resolve, reject) => {
      const { width, height } = canvas;
      ctx.globalCompositeOperation = "multiply";
      const supportsBlendModes = ctx.globalCompositeOperation === "multiply";
      const data = ctx.getImageData(0, 0, width, height);
      const id = data.data.slice(0);
      const { sepia, saturation, gray } = effect;
      for (let i = id.length / 4; i >= 0; --i) {
        let ri = i << 2;
        let gi = ri + 1;
        let bi = ri + 2;
        let r = LUT[0][id[ri]];
        let g = LUT[1][id[gi]];
        let b = LUT[2][id[bi]];
        if (sepia) {
          [r, g, b] = [
            r * 0.393 + g * 0.769 + b * 0.189,
            r * 0.349 + g * 0.686 + b * 0.168,
            r * 0.272 + g * 0.534 + b * 0.131
          ];
        }
        if (gray) {
          [r, g, b] = [
            r * 0.21 + g * 0.72 + b * 0.07,
            r * 0.21 + g * 0.72 + b * 0.07,
            r * 0.21 + g * 0.72 + b * 0.07
          ];
        }
        if (saturation < 1) {
          const avg = (r + g + b) / 3;
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
        ctx.globalCompositeOperation = supportsBlendModes ? "multiply" : "source-over";
        ctx.fillStyle = getGradient(ctx, width, height, [
          "rgba(0,0,0,0)",
          "rgba(0,0,0,0)",
          `rgba(0,0,0,${effect.vignette})`
        ]);
        ctx.fillRect(0, 0, width, height);
      }
      if (effect.lighten) {
        ctx.globalCompositeOperation = supportsBlendModes ? "screen" : "lighter";
        ctx.fillStyle = getGradient(ctx, width, height, [
          `rgba(255,255,255,${effect.lighten})`,
          "rgba(255,255,255,0)",
          "rgba(0,0,0,0)"
        ]);
        ctx.fillRect(0, 0, width, height);
      }
      if (!effect.viewfinder) {
        return resolve(getResult(canvas));
      }
      return loadImageWithCache(effect.viewfinder).then((img) => {
        if (supportsBlendModes) {
          ctx.globalCompositeOperation = "multiply";
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          const [, vfCtx] = createCanvasAndCtxFromImage(img, width, height);
          const { data: vfData } = vfCtx.getImageData(0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          imageData.data.set(imageData.data.map((v, i) => v * vfData[i] / 255));
          ctx.putImageData(imageData, 0, 0);
        }
        return resolve(getResult(canvas));
      });
    });
  };
  const index = (src, partialEffect) => {
    const genSource = typeof src === "string" ? loadImage(src).then(getCanvasAndCtx) : Promise.resolve(getCanvasAndCtx(src));
    return genSource.then(applyEffect({
      ...defaultEffect,
      ...partialEffect
    }));
  };
  return index;
}));
