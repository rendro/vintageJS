import vintagejs from '../src/index.js';

const img = document.getElementById('picture');
const resultImg = document.createElement('img');
img.parentElement.appendChild(resultImg);

vintagejs(img, {
  brightness: -0.1,
  contrast: 0.15,
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
