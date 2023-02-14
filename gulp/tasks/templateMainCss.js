const { src, dest } = require("gulp");
const glob = require("glob");
const cached = require("gulp-cached");
const dependents = require("gulp-dependents");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const beautify = require("gulp-jsbeautifier");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const mergeStream = require("merge-stream");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template main css
const templateMainCss = [];
glob.sync("src/template-*/styles").forEach(tempPath => {
  const tempNameKebab = tempPath.replace(/(src\/|\/styles)/g, "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, g =>
    g[1].toUpperCase()
  );
  const srcPath = [
    "src/pages/**/*.scss",
    "src/styles/**/*.scss",
    `${tempPath}/**/*.scss`,
    "!src/styles/_libraries.scss",
    `!${tempPath}/libraries.scss`,
  ];
  const destPath = tempPath.replace("src", "dist");
  const watchPath = srcPath;

  // common steps between development & production versions
  function CommonSteps(mode) {
    return src(srcPath)
      .pipe(cached(`${tempNameCamel}_mainCss_${mode}_cache`))
      .pipe(dependents())
      .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
      .pipe(autoprefixer("last 2 versions"));
  }

  templateMainCss.push({
    [`${tempNameCamel}_mainCss`]: () => {
      // development version
      const dev_mainCss = new CommonSteps("dev")
        .pipe(beautify({ indent_size: 2 }))
        .pipe(rename("style.css"));

      // production version
      const prod_mainCss = new CommonSteps("prod")
        .pipe(cleanCSS({ compatibility: "ie10" }))
        .pipe(rename("style.min.css"));

      return mergeStream(dev_mainCss, prod_mainCss)
        .pipe(dest(destPath))
        .pipe(connect.reload())
        .pipe(
          notify({
            message: `✔️ ${tempNameKebab} main css task completed!`,
            onLast: true,
          })
        );
    },
    watchPath,
  });
});

module.exports = {
  templateMainCss,
};
