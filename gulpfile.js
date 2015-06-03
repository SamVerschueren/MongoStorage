'use strict';

/**
 * This gulp file describes some tasks to build the library.
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  6 Apr. 2015
 */

// module dependencies
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    del = require('del'),
    moment = require('moment');

var pkg = require('./package.json'),
    banner = ['/**',
              ' * <%= pkg.name %> v<%= pkg.version %>',
              ' * ',
              ' * @author <%= pkg.author.name %>     <<%= pkg.author.email %>>',
              ' * @since  ' + moment().format('DD MMM YYYY'),
              ' */\n'].join('\n');

/**
 * The clean tasks removes the dist folder so that a clean build
 * can be done.
 */
gulp.task('clean', function(cb) {
    del(['dist/'], cb);
});

/**
 * Concatenates all the files for the build.
 */
gulp.task('concat', ['clean'], function() {
    return gulp.src([
            'bower_components/promise-polyfill/Promise.min.js',
            'src/Collection.js', 
            'src/Collection.Modify.js', 
            'src/Collection.Selector.js', 
            'src/*.js', 
            '!src/*.min.js'
        ])
        .pipe(concat(pkg.name + '.js'))
        .pipe(gulp.dest('dist'));
});

/**
 * The build task concatenates and uglifies everything.
 */
gulp.task('build', ['concat'], function() {
    return gulp.src('dist/' + pkg.name + '.js')
        .pipe(sourcemaps.init())
        .pipe(rename(pkg.name + '.min.js'))
        .pipe(uglify())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});
