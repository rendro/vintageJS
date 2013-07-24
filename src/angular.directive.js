// Angular directives for vintageJS
if ( (typeof(angular) === 'object') && (typeof(angular.version) === 'object')){
    angular.module('vintagejs',[])
    .directive('vintage', function($parse) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs) {
                console.log(element);
                console.log(attrs);
                var options = {
                    onError: function() {
                        alert('ERROR');
                    }
                };
                var fx = attrs.vintage;
                fx = fx.split(';'); // CSS like syntax
                var REkey = new RegExp("[a-z]+");
                var REvalue = new RegExp(":.+");
                // Parse Effects
                effect = {};
                for (var i in fx){
                    var value = fx[i].match(REkey);
                    var key = fx[i].match(REvalue);
                    value = value[0];
                    key = key[0].substring(1);
                    if (!isNaN(parseInt(key, 10))) {
                        effect[value] = parseFloat(key);
                    }else{
                        switch (key) {
                            case 'true':
                                effect[value] = true;
                                break;
                            case 'false':
                                effect[value] = false;
                                break;
                            default:
                                effect[value] = key;
                        }
                    }
                }
                new VintageJS(element[0], options, effect);
            }
        };
    });
}else{
    console.log('Angular not detected.');
}

