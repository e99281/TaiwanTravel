const gulp = require('gulp');
const $ = require('gulp-load-plugins')({ lazy: false });
const autoprefixer = require('autoprefixer');
const minimist = require('minimist');
const browserSync = require('browser-sync').create();
$.compiler = require('node-sass');

const plugins = [
  autoprefixer(),
];

// --env dev 和 --env prod 設定
let envOptions = {
  string: 'env',
  default: {
    env: 'develop'
  }
}
let options = minimist(process.argv.slice(2), envOptions);

// gulp setBS4 設定 Bootstrap 4.5.3
gulp.task('setBS4', () => {

  console.log('Bootstrap 4 設計環境設定');

  gulp.src(['./node_modules/popper.js/dist/umd/popper.min.js'])
    .pipe(gulp.dest('./dist/js'));

  gulp.src(['./node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('./dist/js'));

  gulp.src(['./node_modules/bootstrap/dist/js/bootstrap.min.js'])
    .pipe(gulp.dest('./dist/js'));

  gulp.src(['./node_modules/bootstrap/scss/bootstrap.scss'])
    .pipe($.rename('_bootstrap-custom.scss'))
    .pipe(gulp.dest('./src/scss'));
  // 修改 bootstrap-custom 載入路徑 '../../node_modules/bootstrap/scss/'
});



// HTML
gulp.task('copyHtml', () => {
  return gulp.src('./src/**/*.html')
    // dest 輸出
    .pipe(gulp.dest('./dist/'));
});



// sass 開發階段
gulp.task('sass', () => {
  return gulp.src('./src/scss/**/*.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'));
});

// sass 編譯 css 壓縮並產生 sourcemaps 
gulp.task('min-css', () => {
  return gulp.src('./src/scss/**/*.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe($.cssnano()) // 壓縮和優化 CSS
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'));
});

// js 
// Couldn't find preset "@babel/preset-env" relative to directory
gulp.task('babel', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel(
      // {
      //   presets: ['@babel/env'] // 使用預設環境編譯
      // }
    ))
    .pipe($.concat('all.js'))
    .pipe($.uglify())
    // .pipe($.if(options.env === 'prod', $.uglify()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'));
});

// 壓縮圖片
gulp.task('imagemin', function () {
  return gulp.src('./src/images/*')
    .pipe($.imagemin())
    .pipe(gulp.dest('./dist/images'))
})


gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./dist" // 要注意這裡應該要指向到要模擬的伺服器資料夾，也就是 dist
    },
    port: 8080
  });
});

// 監看
gulp.task('watch', gulp.parallel('browser-sync', () => {
  gulp.watch('./src/images/*', gulp.series('imagemin')).on('change', browserSync.reload);
  gulp.watch('./src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('./dist/css').on('change', browserSync.reload);
  gulp.watch('./src/**/*.html', gulp.series('copyHtml')).on('change', browserSync.reload);
  // gulp.watch('./src/js/**/*.js', gulp.series('babel'));
  // gulp.watch('./src/scss/**/*.scss').on('change', browserSync.reload);
  // gulp.watch("./src/**/*.html").on('change', browserSync.reload);
}));

// 清空 css
gulp.task('clean', () => {
  return gulp.src('./dist/css', { read: false })
    .pipe($.clean());
});


gulp.task('default', gulp.series('watch','copyHtml', 'sass','babel','imagemin'));

// gulp build (--env prod)
gulp.task('build', gulp.series('clean', 'min-css'));
