/*globals module*/

module.exports = function (config) {

    'use strict';

    config.set({

        basePath: './',
        frameworks: ['jasmine'],
        singleRun: false,
        files: [
            'bower_components/simple-url/lib/url.js',
            'src/**/*.js',
            'tests/**/*.js'
        ],
        autoWatch: true,
        browsers: ['Chrome']
    });
};
