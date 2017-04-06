module.exports = function( grunt ) {

	"use strict";

	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({

		karma: {

			unit: {

				options: {

					configFile: 'karma.conf.js'
				}
			}
		}
	});
};
