import vintagejs from '../src/index.js';

const img = document.getElementById('picture');
const resultImg = document.createElement('img');
img.parentElement.appendChild(resultImg);

const compose = (f, g) => x => f(g(x));
const idArr = new Array(256).fill(1).map((_, i) => i);
const rgb = c => (-12) * Math.sin(c * 2 * Math.PI / 255) + c;
const r = c =>
  (-0.2) *
    Math.sqrt(255 * c) *
    Math.sin(Math.PI * ((-0.0000195) * c * c + 0.0125 * c)) +
    c;
const g = c => (-0.001045244139166791) * c * c + 1.2665372554875318 * c;
const b = c => 0.57254902 * c + 53;

const curves = {
  r: idArr.map(compose(r, rgb)),
  g: idArr.map(compose(g, rgb)),
  b: idArr.map(compose(b, rgb)),
};

vintagejs(img, {
  vignette: 0.3,
  lighten: 0.2,
  brightness: -0.1,
  contrast: 0.15,
  curves,
  screen: {
    r: 227,
    g: 12,
    b: 169,
    a: 0.15,
  },
  // sepia: true,
}).then(
  function(dataUri) {
    resultImg.src = dataUri;
  },
  function(err) {
    console.error(err);
  },
);
