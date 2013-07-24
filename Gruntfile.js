module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/**!\n' +
                        ' * <%= pkg.name %>\n' +
                        ' * <%= pkg.description %>\n' +
                        ' *\n' +
                        ' * @license <%= pkg.license %>\n'+
                        ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n' +
                        ' * @version <%= pkg.version %>\n' +
                        ' **/\n\n'
            },
            angular: {
                src: [
                    'src/angular.directive.js',
                    'src/vintage.js'
                ],
                dest: 'dist/angular.vintage.js'
            },
            jquery: {
                src: [
                    'src/jquery.header.js',
                    'src/vintage.js',
                    'src/jquery.footer.js'
                ],
                dest: 'dist/jquery.vintage.js'
            },
            vanilla: {
                src: ['src/vintage.js'],
                dest: 'dist/vintage.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-banner');

    // Default task(s).
    grunt.registerTask('default', ['concat']);

};
