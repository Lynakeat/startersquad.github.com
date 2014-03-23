var autoprefix = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var es = require('event-stream');
var gulp = require('gulp');
var jade = require('gulp-jade');
var livereload = require('gulp-livereload');
var lr = require('tiny-lr');
var replace = require('gulp-replace');
var sass = require('gulp-ruby-sass');
var spawn = require('child_process').spawn;
var uglify = require('gulp-uglify');
var handleError = function (err) {
  console.log(err.name, ' in ', err.plugin, ': ', err.message);
  this.emit('end');
};

var server = lr();

// Bump version
gulp.task('bump-version', function () {
  spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.on('data', function (data) {

    // Get current branch name
    var branch = data.toString();

    // Verify we're on a release branch
    if (/^release\/.*/.test(branch)) {
      var newVersion = branch.split('/')[1].trim();

      // Update client index.html
      gulp.src('./source/index.html')
        .pipe(replace(/(bust=v)(\d*\.?)*/g, '$1' + newVersion))
        .pipe(gulp.dest('./source'));

      var updateJson = function (file) {
        gulp.src(file)
          .pipe(replace(/("version" *: *")([^"]*)(",)/g, '$1' + newVersion + '$3'))
          .pipe(gulp.dest('./'));
      };

      updateJson('./bower.json');
      updateJson('./package.json');

      console.log('Successfully bumped to ' + newVersion);
    } else {
      console.error('This task should be executed on a release branch!');
    }
  });
});

// Copy
gulp.task('build', ['jade', 'js', 'sass'], function () {
  return es.concat(
    // update index.html to work when built
    gulp.src(['source/index.html'])
      .pipe(gulp.dest('build')),
    // copy vendor files
    gulp.src(['source/vendor/**/*'])
      .pipe(gulp.dest('build/vendor')),
    // copy assets
    gulp.src(['source/assets/**/*'])
      .pipe(gulp.dest('build/assets'))
  );
});

// Jade
gulp.task('jade', function () {
  return gulp.src('./source/*.jade')
    .pipe(jade({ basedir: __dirname + '/source/jade' }).on('error', handleError))
    .pipe(gulp.dest('./source'));
});

// JavaScript
gulp.task('js', function () {
  return gulp.src('source/js/**/*.js')
    .pipe(uglify().on('error', handleError))
    .pipe(gulp.dest('./build/js/'))
    .pipe(livereload(server));
});

// Sass
gulp.task('sass', function () {
  return gulp.src(['source/sass/*.scss', '!source/sass/_*.scss'])
    .pipe(sass({
      bundleExec: true,
      require: [
        './source/sass/sass_extensions.rb',
        'sass-globbing'
      ]
    }).on('error', handleError))
    .pipe(autoprefix().on('error', handleError))
    //.pipe(csso().on('error', handleError))
    .pipe(gulp.dest('source/assets/css'))
    .pipe(livereload(server));
});

// Watch
gulp.task('watch', ['jade', 'sass'], function () {
  gulp.watch('source/sass/**/*.scss', function () {
    gulp.run('sass');
  });

  gulp.watch('source/**/*.jade', function () {
    gulp.run('jade');
  });

  // enable Livereload
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch([
      'source/assets/*.css',
      'source/index.html',
      'source/js/**/*'
    ]);
  });
});

gulp.task('default', ['build']);
