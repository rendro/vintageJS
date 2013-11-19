module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/**!\n' +
                ' * <%= pkg.name %>\n' +
                ' * <%= pkg.description %>\n' +
                ' *\n' +
                ' * @license <%= pkg.license %>\n'+
                ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n' +
                ' * @version <%= pkg.version %>\n' +
                ' **/\n\n',
        uglify: {
            all: {
                options: {
                    banner: '<%= banner %>',
                    report: 'gzip'
                },
                files: {
                    'dist/angular.vintage.min.js': 'dist/angular.vintage.js',
                    'dist/jquery.vintage.min.js': 'dist/jquery.vintage.js',
                    'dist/vintage.min.js': 'dist/vintage.js'
                }
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>'
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

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);

};
