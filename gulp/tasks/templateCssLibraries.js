const { src, dest } = require("gulp");
const glob = require("glob");
const cached = require("gulp-cached");
const dependents = require("gulp-dependents");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template css libraries
const templateCssLibraries = [];
glob.sync("src/template-*/styles").forEach((tempPath) => {
  const tempNameKebab = tempPath.replace(/(src\/|\/styles)/g, "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, (g) =>
    g[1].toUpperCase()
  );
  const srcPath = [`${tempPath}/libraries.scss`, "src/styles/_libraries.scss"];
  const destPath = tempPath.replace("src", "dist");
  const watchPath = srcPath;

  templateCssLibraries.push({
    [`${tempNameCamel}_cssLibraries`]: () => {
      return src(srcPath)
        .pipe(cached(`${tempNameCamel}_cssLibrariesCache`))
        .pipe(dependents())
        .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
        .pipe(cleanCSS({ compatibility: "ie10" }))
        .pipe(rename("libraries.min.css"))
        .pipe(dest(destPath))
        .pipe(connect.reload())
        .pipe(notify(`✔️ ${tempNameKebab} css libraries task completed!`));
    },
    watchPath,
  });
});

module.exports = {
  templateCssLibraries,
};
