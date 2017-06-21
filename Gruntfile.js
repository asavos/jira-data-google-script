/*globals module*/

module.exports = function (grunt) {

    "use strict";

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.initConfig({

        karma: {

            unit: {

                options: {

                    configFile: 'karma.conf.js'
                }
            }
        },
        clean: ['dist/'],
        concat: {
            build: {
                src: ['src/jira-data-google-script.js', 'bootstrap/bootstrap.js'],
                dest: 'dist/jdgs.js',
            }
        }
    });

    grunt.registerTask('default', ['karma', 'clean', 'concat']);
};
