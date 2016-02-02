var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber');
var modRewrite = require('connect-modrewrite');
var gulpNgConfig = require('gulp-ng-config');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var templateCache = require('gulp-angular-templatecache');
var del = require('del');
var replace = require('gulp-replace');

var build = {
    configFile: 'config.local.json',
    dir: 'bin',
    createSourceMaps: true,
    workDir: 'work',
    clean_directories: ['bin', 'work']
}

var config = {
    paths: {
        html: {
            index: {
                src: 'src/index.html'
            },
            templates: {
                src: ['src/**/*.html', '!src/index.html'],
            }
        },
        javascript: {
            framework: {
                src: require('./framework-scripts.json'),
            },
            app: {
                src: ['src/**/*.module.js', 'src/**/*.js'], //load modules first
            },
            dest: build.dir + '/assets/js',
            revDest: build.workDir + 'js'
        },
        less: {
            src: ['src/assets/less/app.less'],
            dest: build.dir + '/assets/css',
            revDest: build.workDir + '/css'
        },
        images: {
            src: ['src/assets/img/**/*.jpg', 'src/assets/img/**/*.jpeg', 'src/assets/img/**/*.png'],
            dest: build.dir + '/assets/img'
        },
        fonts: {
            src: ['./bower_components/fontawesome/fonts/**/*'],
            dest: build.dir + '/assets/fonts'
        },
        iis: {
            src: ['src/web.config'],
            dest: build.dir
        }
    }
};

gulp.task('start-webserver', ['build'], function () {
    return browserSync({
        port: 8080,
        ghostMode: false,
        online: false,
        minify: false,
        notify: false, //Screws with the test automation
        server: {
            baseDir: build.dir,
            middleware: [
                modRewrite([
                    '^[^\\.]*$ /index.html [L]' //Matches everything that does not contain a '.' (period) (Support for html5 mode)
                ])
            ]
        }
    });
});

gulp.task('index', function () {
    return gulp.src(config.paths.html.index.src)
        .pipe(plumber())
        .pipe(gulp.dest(build.dir));
});

gulp.task('scripts:framework', function () {
    return gulp.src(config.paths.javascript.framework.src)
        .pipe(plumber())
        .pipe(build.createSourceMaps ? sourcemaps.init() : gutil.noop())
        .pipe(concat('framework.js'))
        .pipe(uglify({ output: { ascii_only: true } }))
        .pipe(rev())
        .pipe(build.createSourceMaps ? sourcemaps.write() : gutil.noop())
        .pipe(gulp.dest(config.paths.javascript.dest))
        .pipe(rev.manifest({ path: 'rev-scripts-framework.json' }))
        .pipe(gulp.dest(build.workDir)); //Will join later.
});

gulp.task('scripts:templates', function () {
    return gulp.src(config.paths.html.templates.src)
        .pipe(plumber())
        .pipe(templateCache({
            module: 'templates.module',
            standalone: true
        }))
       .pipe(rename('templates.js'))
       .pipe(gulp.dest(build.workDir)); //Will join later.
});

gulp.task('scripts:config', function () {
    return gulp.src(build.configFile)
       .pipe(gulpNgConfig('configuration.module', { wrap: true }))
       .pipe(rename('config.js'))
       .pipe(gulp.dest(build.workDir)); //Will join later.
});

gulp.task('scripts:app', ['scripts:config', 'scripts:templates'], function () {
    return gulp.src([build.workDir + "/config.js", build.workDir + "/templates.js", 'src/**/*.module.js', 'src/**/*.js'])
        .pipe(plumber())
        .pipe(build.createSourceMaps ? sourcemaps.init() : gutil.noop())
        .pipe(concat('app.js'))
        .pipe(uglify({ output: { ascii_only: true } }))
        .pipe(rev())
        .pipe(build.createSourceMaps ? sourcemaps.write() : gutil.noop())
        .pipe(gulp.dest(config.paths.javascript.dest))
        .pipe(rev.manifest({ path: 'rev-scripts-app.json' }))
        .pipe(gulp.dest(build.workDir));
});

gulp.task('less', function () {
    return gulp.src(config.paths.less.src)
        .pipe(plumber())
        .pipe(build.createSourceMaps ? sourcemaps.init() : gutil.noop())
        .pipe(less({ compress: true }))
        .pipe(concat('app.css'))
        .pipe(rev())
        .pipe(build.createSourceMaps ? sourcemaps.write() : gutil.noop())
        .pipe(gulp.dest(config.paths.less.dest))
        .pipe(rev.manifest({ path: 'rev-less.json' }))
        .pipe(gulp.dest(build.workDir));
});

gulp.task('static', function (callback) {

    // fonts
    var fonts = gulp.src(config.paths.fonts.src)
                    .pipe(plumber())
                    .pipe(gulp.dest(config.paths.fonts.dest))

    // iis
    var iis = gulp.src(config.paths.iis.src)
                        .pipe(plumber())
                        .pipe(gulp.dest(config.paths.iis.dest));

    return merge(fonts, iis);
});

gulp.task('images', function () {
    return gulp.src(config.paths.images.src)
        .pipe(plumber())
        .pipe(gulp.dest(config.paths.images.dest));
});

gulp.task('rev:scripts:framework', ['scripts:framework'], function () {
    return gulp.src([build.workDir + '/**/*.json', build.dir + '/index.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest(build.dir));
});

gulp.task('rev:scripts:app', ['scripts:app'], function () {
    return gulp.src([build.workDir + '/**/*.json', build.dir + '/index.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest(build.dir));
});

gulp.task('rev:less', ['less'], function () {
    return gulp.src([build.workDir + '/**/*.json', build.dir + '/index.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest(build.dir));
});

gulp.task('rev-all', ['rev:scripts:framework', 'rev:scripts:app', 'rev:less']);

gulp.task('clean', function () {
    return del(build.clean_directories);
});

gulp.task('build', function (callback) {
    runSequence('clean', 'scripts:framework', 'scripts:app', 'index', 'less', 'images', 'static', 'rev-all', callback);
});

gulp.task('release-setup', function (callback) {
    build.createSourceMaps = false;
    build.configFile = 'config.release.json';

    callback();
});

gulp.task('release', ['release-setup', 'build']);

gulp.task('default', ['build', 'start-webserver'], function () {
    gulp.watch([config.paths.html.templates.src, config.paths.javascript.app.src], ['scripts:app', 'rev:scripts:app', browserSync.reload]);
    gulp.watch(config.paths.javascript.framework.src, ['scripts:framework', 'rev:scripts:framework', browserSync.reload]);
    gulp.watch(config.paths.images.src, ['images', browserSync.reload]);
    gulp.watch('src/**/*.less', ['less', 'rev:less', browserSync.reload]);
});