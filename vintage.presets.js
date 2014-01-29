var vintagePresets = {
  /**
   * Basic vintage effect
   */
  vintage: {
    curves: (function() {
      var rgb = function (x) {
        return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
      },
      r = function(x) {
        return -0.2 * Math.pow(255 * x, 0.5) * Math.sin(Math.PI * (-0.0000195 * Math.pow(x, 2) + 0.0125 * x ) ) + x;
      },
      g = function(x) {
        return -0.001045244139166791 * Math.pow(x,2) + 1.2665372554875318 * x;
      },
      b = function(x) {
        return 0.57254902 * x + 53;
      },
      c = {r:[],g:[],b:[]};
      for(var i=0;i<=255;++i) {
        c.r[i] = r( rgb(i) );
        c.g[i] = g( rgb(i) );
        c.b[i] = b( rgb(i) );
      }
      return c;
    })(),
    screen: {
      r: 227,
      g: 12,
      b: 169,
      a: 0.15
    },
    vignette: 0.7,
    viewFinder: false // or path to image 'img/viewfinder.jpg'
  },
  /**
   * Sepia effect
   */
  sepia: {
    curves: (function() {
      var rgb = function (x) {
        return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
      },
      c = {r:[],g:[],b:[]};
      for(var i=0;i<=255;++i) {
        c.r[i] = rgb(i);
        c.g[i] = rgb(i);
        c.b[i] = rgb(i);
      }
      return c;
    })(),
    sepia: true
  },
  /**
   * Greenish effect
   */
  greenish: {
    curves: (function() {
      var rgb = function (x) {
        return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
      },
      c = {r:[],g:[],b:[]};
      for(var i=0;i<=255;++i) {
        c.r[i] = rgb(i);
        c.g[i] = rgb(i);
        c.b[i] = rgb(i);
      }
      return c;
    })(),
    vignette: 0.6,
    lighten: 0.1,
    screen: {
      r: 255,
      g: 255,
      b: 0,
      a: 0.15
    }
  },
  /**
   * Reddish effect
   */
  reddish: {
    curves: (function() {
      var rgb = function (x) {
        return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
      },
      c = {r:[],g:[],b:[]};
      for(var i=0;i<=255;++i) {
        c.r[i] = rgb(i);
        c.g[i] = rgb(i);
        c.b[i] = rgb(i);
      }
      return c;
    })(),
    vignette: 0.6,
    lighten: 0.1,
    screen: {
      r: 255,
      g: 0,
      b: 0,
      a: 0.15
    }
  }
};
