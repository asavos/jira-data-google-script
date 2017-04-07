/*globals module*/

module.exports = function (config) {

    'use strict';

    config.set({

        basePath: './',
        frameworks: ['jasmine'],
        singleRun: false,
        files: [
            'src/**/*.js',
            'tests/**/*.js'
        ],
        autoWatch: true,
        browsers: ['Chrome']
    });
};
