(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define([], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.vintagejs = factory());
})(this, function() {
	// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	// src/utils.ts
	var import_nullthrows = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
		function nullthrows(x, message) {
			if (x != null) return x;
			var error = new Error(message !== void 0 ? message : "Got unexpected " + x);
			error.framesToPop = 1;
			throw error;
		}
		module.exports = nullthrows;
		module.exports.default = nullthrows;
		Object.defineProperty(module.exports, "__esModule", { value: true });
	})))());
	var IMAGE_TYPE = "image/jpeg";
	var IMAGE_QUALITY = 1;
	var compose = (f, g) => (x) => f(g(x));
	var hasDOM = () => typeof document !== "undefined" && typeof document.createElement === "function";
	var isHTMLImage = (el) => typeof HTMLImageElement !== "undefined" && el instanceof HTMLImageElement;
	var isHTMLCanvas = (el) => typeof HTMLCanvasElement !== "undefined" && el instanceof HTMLCanvasElement;
	var isImageBitmap = (el) => typeof ImageBitmap !== "undefined" && el instanceof ImageBitmap;
	var isOffscreenCanvas = (el) => typeof OffscreenCanvas !== "undefined" && el instanceof OffscreenCanvas;
	var createCanvas = (width, height) => {
		if (hasDOM()) {
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			return canvas;
		}
		if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
		throw new Error("vintagejs needs either a DOM or OffscreenCanvas support to create a canvas.");
	};
	var get2dContext = (canvas) => (0, import_nullthrows.default)(canvas.getContext("2d"), "Could not get 2d context for canvas");
	var createCanvasAndCtxFromImage = (el, width, height) => {
		if (!width) width = el.width;
		if (!height) height = el.height;
		const canvas = createCanvas(width, height);
		const ctx = get2dContext(canvas);
		ctx.drawImage(el, 0, 0, width, height);
		return [canvas, ctx];
	};
	var cloneCanvasAndCtx = (source) => createCanvasAndCtxFromImage(source, source.width, source.height);
	var getCanvasAndCtx = (el) => {
		if (isHTMLImage(el) || isImageBitmap(el)) return createCanvasAndCtxFromImage(el);
		if (isHTMLCanvas(el) || isOffscreenCanvas(el)) return cloneCanvasAndCtx(el);
		throw new Error(`Unsupported source element. Expected HTMLImageElement, HTMLCanvasElement, OffscreenCanvas or ImageBitmap, got ${typeof el}.`);
	};
	var getGradient = (ctx, width, height, colorSteps) => {
		const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)));
		colorSteps.forEach((color, idx, steps) => {
			gradient.addColorStop(idx / (steps.length - 1), color);
		});
		return gradient;
	};
	var loadImageElement = (src) => new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.crossOrigin = "anonymous";
		img.onerror = (err) => reject(err);
		img.src = src;
	});
	var loadImageBitmap = (src) => fetch(src).then((res) => {
		if (!res.ok) throw new Error(`Could not load image ${src}: HTTP ${res.status}`);
		return res.blob();
	}).then((blob) => createImageBitmap(blob));
	var loadImage = (src) => typeof Image !== "undefined" ? loadImageElement(src) : loadImageBitmap(src);
	var loadImageWithCache = (() => {
		const cache = {};
		return (src) => {
			if (!cache[src]) cache[src] = loadImage(src).catch((err) => {
				delete cache[src];
				throw err;
			});
			return cache[src];
		};
	})();
	var getResult = (canvas) => {
		const getDataURL = (mimeType = IMAGE_TYPE, quality = IMAGE_QUALITY) => {
			if (!isHTMLCanvas(canvas)) throw new Error("getDataURL() needs an HTMLCanvasElement. Use getBlob() when running in a Web Worker.");
			return canvas.toDataURL(mimeType, quality);
		};
		return {
			getDataURL,
			getCanvas() {
				return canvas;
			},
			getBlob(mimeType = IMAGE_TYPE, quality = IMAGE_QUALITY) {
				if (isHTMLCanvas(canvas)) return new Promise((resolve, reject) => {
					canvas.toBlob((blob) => blob ? resolve(blob) : reject(/* @__PURE__ */ new Error("Could not encode canvas")), mimeType, quality);
				});
				return canvas.convertToBlob({
					type: mimeType,
					quality
				});
			},
			genImage(mimeType = IMAGE_TYPE, quality = IMAGE_QUALITY) {
				return new Promise((resolve) => resolve(getDataURL(mimeType, quality))).then(loadImageElement);
			}
		};
	};
	// src/effects.ts
	/**
	* Noise cells across the image's long edge. Grain is generated at this
	* resolution and scaled to the image, so it looks the same on a small preview
	* and on the full-size photo (instead of getting finer as images get larger).
	*/
	var GRAIN_CELLS = 1200;
	var GRAIN_SEED = 24301;
	/** mulberry32: a small seeded PRNG, so grain is identical on every run. */
	var seededRandom = (seed) => {
		let state = seed | 0;
		return () => {
			state = state + 1831565813 | 0;
			let t = Math.imul(state ^ state >>> 15, 1 | state);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	};
	/** Size of the grain texture for an image: at most GRAIN_CELLS on the long edge. */
	var grainSize = (width, height) => {
		const scale = Math.min(1, GRAIN_CELLS / Math.max(width, height));
		return [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))];
	};
	var grainCache = null;
	/** Mid-grey noise texture; the last one is reused (same size, same seed). */
	var createGrain = (width, height) => {
		const [gw, gh] = grainSize(width, height);
		const key = `${gw}x${gh}`;
		if (grainCache && grainCache.key === key) return grainCache.canvas;
		const random = seededRandom(GRAIN_SEED);
		const noise = (amplitude) => (random() + random() + random() - 1.5) * amplitude;
		const cw = Math.max(1, Math.round(gw / 2));
		const ch = Math.max(1, Math.round(gh / 2));
		const coarse = createCanvas(cw, ch);
		const coarseCtx = get2dContext(coarse);
		const coarseImage = coarseCtx.createImageData(cw, ch);
		for (let i = 0; i < coarseImage.data.length; i += 4) {
			const v = 128 + noise(48);
			coarseImage.data[i] = v;
			coarseImage.data[i + 1] = v;
			coarseImage.data[i + 2] = v;
			coarseImage.data[i + 3] = 255;
		}
		coarseCtx.putImageData(coarseImage, 0, 0);
		const canvas = createCanvas(gw, gh);
		const ctx = get2dContext(canvas);
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(coarse, 0, 0, gw, gh);
		const image = ctx.getImageData(0, 0, gw, gh);
		const data = image.data;
		for (let i = 0; i < data.length; i += 4) {
			const v = data[i] + noise(32);
			data[i] = v;
			data[i + 1] = v;
			data[i + 2] = v;
		}
		ctx.putImageData(image, 0, 0);
		grainCache = {
			key,
			canvas
		};
		return canvas;
	};
	/**
	* Film grain, blended with "overlay" so it shows most in the midtones (as on
	* film) and least in deep shadows and highlights. `amount` is 0–1.
	*/
	var applyGrain = (ctx, width, height, amount, supportsBlendModes) => {
		const grain = createGrain(width, height);
		if (supportsBlendModes) {
			ctx.save();
			ctx.globalCompositeOperation = "overlay";
			ctx.globalAlpha = amount;
			ctx.imageSmoothingEnabled = true;
			ctx.drawImage(grain, 0, 0, width, height);
			ctx.restore();
			return;
		}
		const scaledCtx = get2dContext(createCanvas(width, height));
		scaledCtx.drawImage(grain, 0, 0, width, height);
		const noise = scaledCtx.getImageData(0, 0, width, height).data;
		const imageData = ctx.getImageData(0, 0, width, height);
		const data = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			const n = (noise[i] - 128) * amount;
			data[i] += n;
			data[i + 1] += n;
			data[i + 2] += n;
		}
		ctx.putImageData(imageData, 0, 0);
	};
	var DEFAULT_LIGHT_LEAK_COLOR = {
		r: 255,
		g: 112,
		b: 36
	};
	var LEAK_CORE_COLOR = {
		r: 255,
		g: 214,
		b: 150
	};
	/**
	* Center of the leak's glow: just outside the given edge and off-center, the
	* way light gets into a camera through a gap in the back.
	*/
	var lightLeakOrigin = (width, height, edge) => {
		switch (edge) {
			case "left": return [-.06 * width, .62 * height];
			case "top": return [.62 * width, -.06 * height];
			case "bottom": return [.38 * width, 1.06 * height];
			default: return [1.06 * width, .38 * height];
		}
	};
	var clamp01 = (v) => Math.min(1, Math.max(0, v));
	var rgba = ({ r, g, b }, alpha) => `rgba(${r},${g},${b},${clamp01(alpha)})`;
	/** A warm glow bleeding in from one edge, blended with "screen". */
	var applyLightLeak = (ctx, width, height, leak, supportsBlendModes) => {
		const intensity = clamp01(leak.intensity);
		if (intensity === 0) return;
		const color = leak.color || DEFAULT_LIGHT_LEAK_COLOR;
		const [x, y] = lightLeakOrigin(width, height, leak.edge || "right");
		const reach = Math.max(width, height);
		ctx.save();
		ctx.globalCompositeOperation = supportsBlendModes ? "screen" : "lighter";
		let gradient = ctx.createRadialGradient(x, y, 0, x, y, reach * .8);
		gradient.addColorStop(0, rgba(color, intensity));
		gradient.addColorStop(.4, rgba(color, intensity * .45));
		gradient.addColorStop(1, rgba(color, 0));
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);
		gradient = ctx.createRadialGradient(x, y, 0, x, y, reach * .32);
		gradient.addColorStop(0, rgba(LEAK_CORE_COLOR, intensity * .9));
		gradient.addColorStop(1, rgba(LEAK_CORE_COLOR, 0));
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);
		ctx.restore();
	};
	// src/index.ts
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
		contrast: 0,
		grain: 0,
		lightLeak: false
	};
	var idFn = (c) => c;
	var curvesFn = (curves) => (c) => curves[c];
	var contrastFn = (f) => (c) => 259 * (f * 256 + 255) / (255 * (259 - f * 256)) * (c - 128) + 128;
	var brightnessFn = (f) => (c) => c + f * 256;
	var screenFn = (sa) => (sc) => (c) => 255 - (255 - c) * (255 - sc * sa) / 255;
	var getLUT = (effect) => {
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
		const idArr = (/* @__PURE__ */ new Uint8ClampedArray(256)).map((_, idx) => idx);
		return [
			idArr.map(rMod),
			idArr.map(gMod),
			idArr.map(bMod)
		];
	};
	var applyEffect = (effect) => {
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
				if (sepia) [r, g, b] = [
					r * .393 + g * .769 + b * .189,
					r * .349 + g * .686 + b * .168,
					r * .272 + g * .534 + b * .131
				];
				if (gray) [r, g, b] = [
					r * .21 + g * .72 + b * .07,
					r * .21 + g * .72 + b * .07,
					r * .21 + g * .72 + b * .07
				];
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
			if (effect.lightLeak) applyLightLeak(ctx, width, height, effect.lightLeak, supportsBlendModes);
			if (effect.grain > 0) applyGrain(ctx, width, height, Math.min(1, effect.grain), supportsBlendModes);
			if (!effect.viewfinder) return resolve(getResult(canvas));
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
			}, reject);
		});
	};
	var vintagejs = (src, partialEffect) => {
		return (typeof src === "string" ? loadImage(src).then(getCanvasAndCtx) : Promise.resolve(getCanvasAndCtx(src))).then(applyEffect({
			...defaultEffect,
			...partialEffect
		}));
	};
	return vintagejs;
});
