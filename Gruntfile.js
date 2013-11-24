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
                ' **/',
        clean: ['dist'],
        uglify: {
            all: {
                options: {
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
            angular: {
                src: [
                    'src/angular.directive.js',
                    'src/vintage.js'
                ],
                dest: 'dist/angular.vintage.js'
            },
            jquery: {
                src: [
                    'src/vintage.js',
                    'src/jquery.js'
                ],
                dest: 'dist/jquery.vintage.js'
            },
            vanilla: {
                src: ['src/vintage.js'],
                dest: 'dist/vintage.js'
            }
        },
        umd: {
            vanilla: {
                src: '<%= concat.vanilla.dest %>',
                objectToExport: 'VintageJS',
                amdModuleId: 'vintagejs',
                globalAlias: 'VintageJS'
            },
            jquery: {
                src: '<%= concat.jquery.dest %>',
                objectToExport: 'VintageJS',
                amdModuleId: 'vintagejs',
                globalAlias: 'VintageJS',
                deps: {
                    'default': ['$'],
                    amd: ['jquery'],
                    cjs: ['jquery'],
                    global: ['jQuery']
                }
            },
            angular: {
                src: '<%= concat.angular.dest %>',
                objectToExport: 'VintageJS',
                amdModuleId: 'vintagejs',
                globalAlias: 'VintageJS',
                deps: {
                    'default': ['angular']
                }
            }
        },
        usebanner: {
            all: {
                options: {
                    banner: '<%= banner %>'
                },
                files: {
                    srd: ['dist/*.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-umd');

    // Default task(s).
    grunt.registerTask('default', [
        'clean',
        'concat',
        'umd',
        'uglify',
        'usebanner'
    ]);

};
