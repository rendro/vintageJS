(function () {
        var redCurve = function (x) {
            var newValue = -0.2 * Math.pow((255*x),0.5) * Math.sin(Math.PI * (-0.0000195* Math.pow(x,2) + 0.0125 * x ) ) + x;
            newValue = parseInt(newValue,10);
            if (newValue > 255) {
                newValue = 255;
            } else if (newValue < 0) {
                newValue = 0;
            }
            return newValue;
        };
        var greenCurve = function (x) {

             var newValue = -0.001045244139166791 * Math.pow(x,2) +  1.2665372554875318 * x;
             newValue = parseInt(newValue,10);
             if (newValue > 255) {
               newValue = 255;
            } else if (newValue < 0) {
                newValue = 0;
            }
            return newValue;
        };
        var blueCurve = function (x) {

             var newValue = 0.57254902*x + 53;
             newValue = parseInt(newValue,10);
             if (newValue > 255) {
               newValue = 255;
            } else if (newValue < 0) {
                newValue = 0;
            }
            return newValue;
        };
        var rgbCurve = function (x) {

             var newValue = -12 * Math.sin( x * 2 * Math.PI / 255 ) + x
             newValue = parseInt(newValue,10);
             if (newValue > 255) {
               newValue = 255;
            } else if (newValue < 0) {
                newValue = 0;
            }
            return newValue;
        };

        var r=[],g=[],b=[];
        for (var i=0; i<256; i++) {
            r[i] = redCurve(rgbCurve(i));
            g[i] = greenCurve(rgbCurve(i));
            b[i] = blueCurve(rgbCurve(i));
        }
        console.log(r);
        console.log(g);
        console.log(b);

})();
