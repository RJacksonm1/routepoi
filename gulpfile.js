var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var gulp = require('gulp');
var include = require('gulp-include');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var sass = require('gulp-sass');
var scsslint = require('gulp-scss-lint');
var sourcemaps = require('gulp-sourcemaps');
var streamqueue = require('streamqueue');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');


/**
 * Settings
 */
var src = 'src/';
var dest = 'build/';

var src_paths = {
  styles: src + '_css/**/*.scss',
  vendor_styles: [
    'node_modules/leaflet/dist/leaflet.css',
    'node_modules/leaflet.markercluster/dist/MarkerCluster.css',
    'node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css'
  ],

  scripts: src + '_js/**/*.js',
  vendor_scripts: [
    'node_modules/leaflet/dist/leaflet.js',
    'node_modules/leaflet-geometryutil/src/leaflet.geometryutil.js',
    'node_modules/leaflet-routeboxer/src/leaflet-routeboxer.js',
    'node_modules/url-search-params/build/url-search-params.js',
    'node_modules/leaflet.markercluster/dist/leaflet.markercluster-src.js',
    'node_modules/leaflet.featuregroup.subgroup/dist/leaflet.featuregroup.subgroup-src.js',
  ],

  assets: [
    src + '_assets/**/*',
    'node_modules/coop-frontend-toolkit/static/**/*',
    'node_modules/leaflet/dist/**/*',
    'node_modules/leaflet.markercluster/dist/*',
  ],
  html: src + '**/*.html'
};

var dest_paths = {
  styles: dest + 'assets/css',
  scripts: dest + 'assets/js',
  assets: dest + 'assets',
};

var settings = {
  sass: {
    outputStyle: 'compressed',
    includePaths: [
      'node_modules/coop-frontend-toolkit/styles/',
      src + 'src/css'
    ]
  },
  autoprefixer: {
    browsers: ['> 5%', 'last 2 versions']
  }
};



/**
 * Lint tasks
 */
gulp.task('lintjs', function() {
  gulp.src(src_paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('lintscss', function() {
  gulp.src(src_paths.styles)
    .pipe(scsslint());
});


/**
 * Build tasks
 */

// Jekyll
gulp.task('html', ['jekyll'], function() {
  gulp.src(dest + '**/*.html')
    .pipe(connect.reload());
});
gulp.task('jekyll', function (gulpCallBack){
  var spawn = require('child_process').spawn;
  var jekyll = spawn('jekyll', ['build'], {stdio: 'inherit', cwd: 'src'});

  jekyll.on('exit', function(code) {
    gulpCallBack(code === 0 ? null : 'ERROR: Jekyll process exited with code: '+code);
  });
});

// Styles
gulp.task('css', ['lintscss'], function() {
  var sassStream = gulp.src(src_paths.styles)
    .pipe(sourcemaps.init())
      .pipe(sass(settings.sass))
      .on('error', sass.logError)
      .pipe(autoprefixer(settings.autoprefixer));

  var cssStream = gulp.src(src_paths.vendor_styles)
    .pipe(sourcemaps.init());

  streamqueue({ objectMode: true },
    sassStream,
    cssStream
  )
    .pipe(sourcemaps.write('maps/'))
    .pipe(concat('main.css'))
    .pipe(gulp.dest(dest_paths.styles))
    .pipe(connect.reload());
});

// Scripts
gulp.task('js', ['lintjs'], function() {
  var vendorStream = gulp.src(src_paths.vendor_scripts)
    .pipe(sourcemaps.init());

  var mainStream = gulp.src(src_paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(include())
    .pipe(babel({
      presets: ['es2015']
    }));

    streamqueue({ objectMode: true },
        vendorStream,
        mainStream
    )
      .pipe(concat('main.js'))
      // .pipe(uglify())
      .pipe(sourcemaps.write('maps/'))
      .pipe(gulp.dest(dest_paths.scripts))
      .pipe(connect.reload());
});

// Static assets
gulp.task('assets', function() {
  gulp.src(src_paths.assets)
    .pipe(gulp.dest(dest_paths.assets))
    .pipe(connect.reload());
});


/**
 * Tests
 */
gulp.task('testjs', function() {
  gulp.src('test.js')
    .pipe(mocha());
});



/**
 * Watch tasks
 */
gulp.task('watch', function() {
  gulp.watch(src_paths.styles, ['lintscss', 'css']);
  gulp.watch(src_paths.scripts, ['lintjs', 'js']);
  gulp.watch(src_paths.assets, ['assets']);
  gulp.watch([src_paths.html, src + '_config.yml'], ['html']);
});


/**
 * Local server
 */
gulp.task('connect', function() {
  connect.server({
    port: 9000,
    root: 'build',
    livereload: true
  });
});

/**
 * Run tasks
 */
gulp.task('test', ['testjs']);
gulp.task('build', ['html', 'css', 'js', 'assets']);
gulp.task('server', ['build', 'watch', 'connect']);

gulp.task('default', ['server']);
