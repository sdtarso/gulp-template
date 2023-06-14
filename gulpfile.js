const { src, dest, watch, series, parallel } = require("gulp");
const concat = require("gulp-concat");
const sass = require("gulp-sass")(require("node-sass"));
const sourceMaps = require("gulp-sourcemaps");
const htmlmin = require("gulp-html-minifier-terser");
const minifyCss = require("gulp-minify-css");
const minifyJs = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const livereload = require("gulp-livereload");
const argv = require("yargs").argv;

const isProduction = argv.build !== undefined;

const bundleHtml = () => {
  const task = src("./src/index.html");
  isProduction && task.pipe(htmlmin({ collapseWhitespace: true }));
  task.pipe(dest("dist"));
  isProduction || task.pipe(livereload());
  return task;
};

const bundleCss = () => {
  const task = src(["./src/scss/index.scss"])
    .pipe(sourceMaps.init())
    .pipe(concat("styles.scss"))
    .pipe(sass().on("error", sass.logError));
  isProduction && task.pipe(minifyCss());
  task.pipe(sourceMaps.write()).pipe(dest("./dist/css"));
  isProduction || task.pipe(livereload());
  return task;
};

const bundleJs = () => {
  const task = src(["./src/js/*.js"]).pipe(sourceMaps.init());
  isProduction && task.pipe(minifyJs());
  task.pipe(concat("main.js")).pipe(sourceMaps.write()).pipe(dest("./dist/js"));
  isProduction || task.pipe(livereload());
  return task;
};

const bundleImgs = () =>
  src([
    "./src/images/*.gif",
    "./src/images/*.jpeg",
    "./src/images/*.jpg",
    "./src/images/*.png",
    "./src/images/*.webp",
  ])
    .pipe(imagemin())
    .pipe(dest("./dist/images"));

const devWatch = () => {
  livereload.listen();
  watch(["./src/scss/*.scss", "./src/scss/*/*.scss"], bundleCss);
  watch("./src/js/*.js", bundleJs);
  watch("./src/index.html", bundleHtml);
};

const build = () => parallel(bundleHtml, bundleCss, bundleJs, bundleImgs);

exports.bundleCss = bundleCss;
exports.bundleJs = bundleJs;
exports.watch = series(build(), devWatch);
exports.default = build();
