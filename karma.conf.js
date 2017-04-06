/*globals module*/

module.exports = function (config) {

    'use strict';

    config.set({

        basePath: './',
        frameworks: ['jasmine'],
        singleRun: true,
        files: [
            'src/**/*.js',
            'tests/**/*.js'
        ],
        autoWatch: true,
        browsers: ['Chrome']
    });
};
