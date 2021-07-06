const gulp = require("gulp");

const del = require("del");
const autoprefixer = require("autoprefixer");
const hb = require("gulp-hb");
const tailwindcss = require('tailwindcss');
const postcss = require('gulp-postcss');
const beautify = require('gulp-beautify');
const imagemin = require('gulp-imagemin');
const cssnano = require('cssnano');
const postcssImport = require('postcss-import');
const postCSSMixins = require('postcss-mixins');
const postcssPresetEnv = require('postcss-preset-env');
const browsersync = require('browser-sync');
const hbLayouts = require('handlebars-layouts');
const posthtml = require('gulp-posthtml');
const posthtmlInlineAssets = require('posthtml-inline-assets');
const minifyClassnames = require('posthtml-minify-classnames');

const paths = {
  dist: "./dist/",
  views: {
    src: "./src/**/*.html",
    layouts: "./src/layouts/",
    partials: "./src/partials/",
    pages: "./src/*.html",
    dist: "./dist/",
    watch: "./src/**/*.{html,hbs}",
  },
	js: {
		src: './src/js/*.js',
		dist: './dist/js/',
		watch: './src/js/**/*.js',
	},
	css: {
		src: './src/css/*.css',
		dist: './dist/css/',
		watch: './src/css/**/*.css',
	},
  fonts: {
    src: "./src/fonts/**/*.{woff,woff2,eot,ttf,svg}",
    dist: "./dist/fonts/",
    watch: "./src/fonts/**/*.{woff,woff2,eot,ttf,svg}",
  },
	images: {
		src: [
			'./src/images/**/*.{jpg,jpeg,png,gif,tiff,svg}',
		],
		dist: './dist/images/',
		watch: './src/images/**/*.{jpg,jpeg,png,gif,svg,tiff}',
	},
};

// -------------------------------------
//   Task: clean
// -------------------------------------
gulp.task("clean", function () {
  return del(paths.dist);
});

// -------------------------------------
//   Task: postcss
// -------------------------------------
const pxtoremOptions = {
	replace: true,
	propList: ['font', 'font-size', 'line-height', 'letter-spacing', 'margin*', 'padding*', '*width', '*height'],
	mediaQuery: true
};

const CSSplugins = [
	postcssImport,
	postCSSMixins,
	postcssPresetEnv({
		stage: 0,
		features: {
			'nesting-rules': true,
			'color-mod-function': true,
			'custom-media': true,
		},
	}),
	tailwindcss,
	autoprefixer,
	cssnano({
		preset: [
			'default', {
				discardComments: { removeAll: true }
			}
		]
	}),
];

gulp.task('postcss', function () {
	return gulp.src(paths.css.src)
		.pipe(postcss(CSSplugins))
		.pipe(gulp.dest(paths.css.dist))
		.pipe(browsersync.stream());
});

// -------------------------------------
//   Task: JavaScript
// -------------------------------------
gulp.task("js", function () {
  return gulp.src(paths.js.src).pipe(gulp.dest(paths.js.dist));
});

// -------------------------------------
//   Task: fonts
// -------------------------------------
gulp.task("fonts", function () {
  return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dist));
});

// -------------------------------------
//   Task: images
// -------------------------------------
gulp.task("images", function () {
  return gulp.src(paths.images.src)
		.pipe(imagemin())
		.pipe(gulp.dest(paths.images.dist));
});

// -------------------------------------
//   Task: views
// -------------------------------------
gulp.task("views", function () {
  let hbStream = hb()
		.partials(paths.views.layouts + '**/*.{hbs,html}')
    .partials(paths.views.partials + "**/*.{hbs,html}")
		.helpers(hbLayouts);

  return gulp
    .src(paths.views.src)
    .pipe(hbStream)
    .pipe(
      beautify.html({
        indent_size: 2,
        preserve_newlines: false,
      })
    )
    .pipe(gulp.dest(paths.views.dist))
    .on("end", browsersync.reload);
});

// -------------------------------------
//   Task: mangle css classes
// -------------------------------------
gulp.task("mangleCSS", function () {
	const transforms = {
		style: {
			resolve(node) {
				node.tag === 'link' && console.log(node.attrs.href);
				node.tag === 'link' && console.log(node.attrs.rel);
				return node.tag === 'link' && node.attrs && node.attrs.rel === 'stylesheet' && `${node.attrs.href}`;
			},
			transform(node, data) {
				delete node.attrs.href;
				delete node.attrs.rel;

				node.tag = 'style';

				node.content = [
					data.buffer.toString('utf8')
				];
			}
		},
		script: undefined,
		image: undefined
	};

	const plugins = [posthtmlInlineAssets({ transforms }), minifyClassnames()];

  return gulp
    .src(['dist/*.html'])
		.pipe(posthtml(plugins))
    .pipe(gulp.dest(paths.dist));
});

// -------------------------------------
//   Tast: server
// -------------------------------------
gulp.task('server', function (done) {
	browsersync.init({
		server: './dist/',
		port: 4000,
		notify: true,
		open: false
	});
	gulp.watch([paths.views.watch], { usePolling: true }, gulp.parallel('views'));
	gulp.watch(paths.css.watch, { usePolling: true }, gulp.parallel('postcss'));
	gulp.watch(paths.images.watch, { usePolling: true }, gulp.parallel('images'));
	gulp.watch(paths.js.watch, { usePolling: true }, gulp.parallel('js'));
	return done();
});


// -------------------------------------
//   Tast: Dev warning
// -------------------------------------
gulp.task('dev-warning', function (done) {
	console.log('');
	console.log("⚠️  Run 'npm run build' first to process assets and generate the /dist folder first!! ⚠️");
	console.log('');

	return done();
});


// -------------------------------------
//   Task: dev
// -------------------------------------
gulp.task('dev', gulp.series('dev-warning', 'server'));

// -------------------------------------
//   Task: build
// -------------------------------------
gulp.task('build', gulp.series('clean', gulp.parallel('postcss', 'fonts', 'images', 'js', 'views')));

// -------------------------------------
//   Task: build-prod
// -------------------------------------
gulp.task('build-prod', gulp.series('build', 'mangleCSS'));

// -------------------------------------
//   Task: default
// -------------------------------------
gulp.task('default', gulp.series('build', 'server'));
