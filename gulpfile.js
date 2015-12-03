/*
* gulpfile.js
*/

var gulp = require('gulp');
var gutil = require('gulp-util');
var ghelper = require('gulp-helper');
ghelper.require();

var pkg = require('./package.json');
var config = require('./src/config.json');
var ip = require('ip');

var banner = [
  "/* ",
  " * <%= pkg.name %> <%= pkg.version %>",
  " * <%= pkg.description %>",
  " * MIT Licensed",
  " * ",
  " * Copyright (C) 2015 phi, http://phinajs.com",
  " */",
  "",
  "",
].join('\n');



gulp.task('default', ['uglify']);
gulp.task('dev', ['watch', 'webserver']);

gulp.task('concat', function() {
  var scripts = config.files.map(function(f) {
    return './src/' + f;
  });

  return gulp.src(scripts)
    .pipe(concat(pkg.name))
    .pipe(replace('<%= version %>', pkg.version))
    .pipe(header(banner, {
      pkg: pkg,
    }))
    .pipe(gulp.dest('./build/'))
    ;
});

gulp.task('uglify', ['concat'], function() {
  return gulp.src('./build/' + pkg.name)
    .pipe(uglify({
    }))
    .pipe(header(banner, {
      pkg: pkg,
    }))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('./build/'))
    .on('end', function() {
      util.log(util.colors.blue('finish'));
      gutil.beep();
    });
});

gulp.task('watch', function() {
  gulp.watch(['./src/*', './src/**/*'], ['default']);
});


gulp.task('webserver', function() {
  gulp.src('.')
    .pipe(webserver({
      host: ip.address(),
      // livereload: true,
      // port: 9000,
      directoryListing: true,
      open: true,
    }));
});

gulp.task('download', function() {
  download('http://tmlife.net')
    .pipe(gulp.dest('downloads/'));
});

