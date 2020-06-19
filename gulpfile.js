const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const wait = require("gulp-wait");
const csso = require("gulp-csso");
const browserSync = require("browser-sync").create();
const webpack = require("webpack");
const fileinclude = require("gulp-file-include");

const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig = require("./webpack.config.develop");
const bundler = webpack(webpackConfig);

//tryb developerski
let developmentMode = false;

sass.compiler = require("sass");

const server = function (cb) {
	const config = {
		server: {
			baseDir: "./dist",
		},
		open: true,
		notify: false,
	};

	if (developmentMode) {
		config.server.middleware = [
			webpackDevMiddleware(bundler, {
				publicPath: webpackConfig.output.publicPath, //odwołujemy się do konfiguracji webpacka
				stats: { colors: true },
			}),
			webpackHotMiddleware(bundler),
		];
	}

	browserSync.init(config);
	cb();
};

const css = function () {
	return gulp
		.src("src/scss/style.scss")
		.pipe(wait(500))
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: "expanded",
			}).on("error", sass.logError)
		)
		.pipe(autoprefixer())
		.pipe(
			rename({
				suffix: ".min",
				basename: "style",
			})
		)
		.pipe(csso())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/css"))
		.pipe(browserSync.stream());
};

const js = function (cb) {
	//https://github.com/webpack/docs/wiki/usage-with-gulp#normal-compilation
	return webpack(require("./webpack.config.js"), function (err, stats) {
		if (err) throw err;
		console.log(stats.toString());
		browserSync.reload();
		cb();
	});
};

const html = function (cb) {
	return gulp
		.src("src/html/index.html")
		.pipe(
			fileinclude({
				prefix: "@@",
				basepath: "@file",
			})
		)
		.pipe(gulp.dest("dist"));
};

const htmlReload = function (cb) {
	browserSync.reload();
	cb();
};

const watch = function () {
	gulp.watch("src/scss/**/*.scss", { usePolling: true }, gulp.series(css));
	gulp.watch(
		"src/html/**/*.html",
		{ usePolling: true },
		gulp.series(html, htmlReload)
	);
	if (!developmentMode) {
		gulp.watch(
			"src/js/**/*.js",
			{ usePolling: true, delay: 300 },
			gulp.series(js)
		);
	}
};

const developOn = function (cb) {
	developmentMode = true;
	cb();
};

exports.default = gulp.series(startText, css, html, js, server, watch);
exports.css = css;
exports.develop = gulp.series(developOn, css, html, server, watch);
exports.html = html;
exports.watch = watch;
exports.js = js;
