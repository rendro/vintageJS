import vintagejs from '../src/index.js';
import { loadImage } from '../src/utils.js';

const compose = (f, g) => x => f(g(x));
const idArr = new Uint8ClampedArray(256).map((_, i) => i);
const rgb = c => (-12) * Math.sin(c * 2 * Math.PI / 255) + c;
const r = c =>
  (-0.2) *
    Math.sqrt(255 * c) *
    Math.sin(Math.PI * ((-0.0000195) * c * c + 0.0125 * c)) +
  c;
const g = c => (-0.001045244139166791) * c * c + 1.2665372554875318 * c;
const b = c => 0.57254902 * c + 53;

const curves1 = {
  r: idArr.map(compose(r, rgb)),
  g: idArr.map(compose(g, rgb)),
  b: idArr.map(compose(b, rgb)),
};

const rgb2 = c => (-12) * Math.sin(c * 2 * Math.PI / 255) + c;
const curves2 = {
  r: idArr.map(rgb2),
  g: idArr.map(rgb2),
  b: idArr.map(rgb2),
};

const effect = {
  vignette: 0.5,
  lighten: 0.3,
  brightness: -0.1,
  contrast: 0.15,
  curves: curves2,
  saturation: 0.7,
  viewfinder: './film-1.jpg',
  screen: {
    r: 227,
    g: 12,
    b: 169,
    a: 0.15,
  },
  sepia: true,
};

const img = document.getElementById('picture');
const resultImg = document.createElement('img');
img.parentElement.appendChild(resultImg);

vintagejs(img, effect).then(res => {
  resultImg.src = res.getDataURL();
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
loadImage('./dude.jpg').then(img => {
  const { width, height } = img;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  console.time();
  vintagejs(canvas, effect).then(res => {
    console.timeEnd();
    ctx.drawImage(res.getCanvas(), 0, 0, width, height);
  });
});
