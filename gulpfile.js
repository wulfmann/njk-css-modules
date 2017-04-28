var gulp 			 = require('gulp'),
	fs               = require('fs'),
	path             = require('path'),
	runSequence 	 = require('run-sequence');

/* Server */
var browserSync 	 = require('browser-sync').create(),
	clean 			 = require('gulp-clean'),
	reload      	 = browserSync.reload;

/* HTML */
var nunjucksRender   = require('gulp-nunjucks-render');

/* CSS */
var postcss 		 = require('gulp-postcss'),
	modules 		 = require('postcss-modules'),
	cssnano 		 = require('cssnano'),
	autoprefixer 	 = require('autoprefixer'),
	stylus 			 = require('gulp-stylus');

/* Paths */
var paths = {
	html: {
		src: "src/html/pages/**/*.+(njk|nunjucks|html)",
		templates: "src/html/templates",
		dest: "dist/"
	},
	css : {
		src: "src/css/styles.styl",
		dest: "dist/css"
	},
	dist: 'dist'
};

/* Server Task */
gulp.task('serve', ['build'], function() {
    browserSync.init({
        server: {
            baseDir: paths.dist
        }
    });

    gulp.watch('src/css/**/*', ['html']);
    gulp.watch('src/html/**/*', ['html']);
    gulp.watch('dist/**/*.+(html|json)', reload);
});

function getJsonFromCssModules(cssFileName, json) {
	var cssName = path.basename(cssFileName, '.css');
	var jsonFileName = path.resolve(paths.dist, `${ cssName }.json`);
	fs.writeFileSync(jsonFileName, JSON.stringify(json));
}

function getClass(module, className) {
  var moduleFileName  = path.resolve(paths.dist, `${ module }.json`);
  var classNames      = fs.readFileSync(moduleFileName).toString();
  return JSON.parse(classNames)[className];
}

/* Styles Task */
gulp.task('styles', function () {

	var plugins = [
		autoprefixer,
		modules({ getJSON: getJsonFromCssModules }),
		cssnano
    ];

	return gulp.src(paths.css.src)
		.pipe(stylus())
		.pipe(postcss(plugins))
		.pipe(gulp.dest(paths.css.dest))
		.pipe(browserSync.stream());
});

/* HTML Task */
var nunjucksOptions = {
    path: [paths.html.src, paths.html.templates],
    data: {
    	className: getClass
    }
}

gulp.task('html', ['styles'], function () {
	return gulp.src(paths.html.src)
		.pipe(nunjucksRender(nunjucksOptions))
		.pipe(gulp.dest(paths.html.dest));
});

/* Clean Task */
gulp.task('clean', function(cb) {
	return gulp.src('dist/**/*', {read: false})
		.pipe(clean());
});

/* Build Task */
gulp.task('build', function (cb) {
  runSequence('clean', ['html'], cb)
});

gulp.task('default', ['serve']);