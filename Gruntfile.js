'use strict';

module.exports = function(grunt) {
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/**\n' +
                        ' * <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                        ' * (c) <%= pkg.author %>\n' +
                        ' * License: <%= pkg.license %>\n' +
                        ' */',
                sourceMap: true,
                sourceMapName: 'build/<%= pkg.name %>.min.js.map'
            },
            build: {
                src: ['src/Collection.js', 'src/Collection.Modify.js', 'src/Collection.Selector.js', 'src/*.js', '!src/*.min.js'],
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
    });

    // Load the tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Register the tasks
    grunt.registerTask('build', 'Build the minified file', ['uglify']);
};