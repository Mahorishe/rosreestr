const { src, dest, watch, series, parallel } = require('gulp');
const scss          = require('gulp-sass')(require('sass'));
const concat        = require('gulp-concat');
const autoprefixer  = require('gulp-autoprefixer');
const uglify        = require('gulp-uglify');
const imagemin      = require('gulp-imagemin');
const del           = require('del');
const sync          = require('browser-sync').create();
const fs            = require('fs');
const fonter        = require('gulp-fonter');
const ttf2woff2     = require('gulp-ttf2woff2');

const browserSync = () => {
  sync.init({
    server: {
      baseDir: 'src/'
    },
    notify: false
  })
}

const styles = () => {
  return src('src/scss/style.scss')
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('src/css'))
    .pipe(sync.stream())
}

const scripts = () => {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'src/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('src/js'))
  .pipe(sync.stream())
}

const images = () => {
  return src('src/images/**/*.*')
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
      plugins: [
        { name: 'removeViewBox', active: true },
        { name: 'cleanupIDs', active: false}
      ]
    })
  ]))
  .pipe(dest('dist/images'))
}

const build = () => {
  return src([
    'src/**/*.html',
    'src/css/style.min.css',
    'src/js/main.min.js'
  ], {base: 'src'})
  .pipe(dest('dist'))
}

const reset = () => {
  return del('dist')
}

const otfToTtf = () => {
  return src('src/fonts/*.otf')
  .pipe(fonter({
    formats: ['ttf']
  }))
  .pipe(dest('src/fonts/'))
}

const ttfToWoff = () => {
  return src('src/fonts/*.ttf')
  .pipe(fonter({
    formats: ['woff']
  }))
  .pipe(dest('src/fonts/'))
  .pipe(src('src/fonts/*.ttf'))
  .pipe(ttf2woff2())
  .pipe(dest('src/fonts/'))
}

const fontsStyle = () => {
  let fontsFile = 'src/scss/_fonts.scss';
  fs.readdir('src/fonts/', function (err, fontsFiles) {
    if (fontsFiles) {
      if (!fs.existsSync(fontsFile)){
        fs.writeFile(fontsFile, '', cb);
        let newFileOnly;
        for (var i = 0; i < fontsFiles.length; i++) {
          let fontFileName = fontsFiles[i].split('.')[0];
          if (newFileOnly !== fontFileName) {
            let fontName = fontFileName.split('-')[0] ? fontFileName.split('-')[0] : fontFileName;
            let fontWeight = fontFileName.split('-')[1] ? fontFileName.split('-')[1] : fontFileName;
            if (fontWeight.toLowerCase() === 'thin') {
              fontWeight = 100;
            } else if (fontWeight.toLowerCase() === 'extralight') {
              fontWeight = 200;
            } else if (fontWeight.toLowerCase() === 'light') {
              fontWeight = 300;
            } else if (fontWeight.toLowerCase() === 'medium') {
              fontWeight = 500;
            } else if (fontWeight.toLowerCase() === 'semibold') {
              fontWeight = 600;
            } else if (fontWeight.toLowerCase() === 'bold') {
              fontWeight = 700;
            } else if (fontWeight.toLowerCase() === 'extrabold' || fontWeight.toLowerCase() === 'heavy') {
              fontWeight = 800;
            } else if (fontWeight.toLowerCase() === 'black') {
              fontWeight = 900;
            } else {
              fontWeight = 400;
            }
            fs.appendFile(fontsFile,`@font-face {\n\tfont-family: '${fontName}';\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontFileName}.woff2") format("woff2"), url("../fonts/${fontFileName}.woff") format("woff");\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\r\n`, cb);
            newFileOnly = fontFileName;
          }
        }
      } else {
        // Если файл есть, выводим сообщение
        console.log("Файл scss/fonts.scss уже сушествуетю Для обновления необходимо его удалить");
      }
    }
  });

  return src('./src');
  function cb() {}
}

const watcher = () => {
  watch(['src/scss/**/*.scss'], styles);
  watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts);
  watch(['src/**/*.html']).on('change', sync.reload);
}

const fonts = series(otfToTtf, ttfToWoff, fontsStyle);

exports.styles = styles;
exports.scripts = scripts;
exports.browserSync = browserSync;
exports.images = images;
exports.build = series(reset, images, build);
exports.reset = reset;
exports.fonts = fonts;
exports.watcher = watcher;

exports.default = parallel(styles, scripts, browserSync, watcher);