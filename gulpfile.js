var watch = require('gulp-watch');
var postcss = require('gulp-postcss');
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var importer = require("postcss-import");
var nested = require('postcss-nested');

gulp.task('default', function() {
    //sdf
});

gulp.task('css', function () {
    var processors = [
        //autoprefixer({browsers: ['last 1 version']}),
        importer({from: './css/'}),
        nested
    ];
    return gulp.src('./css/style.css')
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./theMetaCityMedia/static/css/'));
});

gulp.task('watch', function() {
    gulp.watch('css/**/*.css', ['css']);
});