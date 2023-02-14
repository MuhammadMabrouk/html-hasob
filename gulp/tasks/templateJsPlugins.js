const { src, dest } = require("gulp");
const fs = require("fs");
const glob = require("glob");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template js plugins
const templateJsPlugins = [];
glob.sync("src/template-*/scripts").forEach((tempPath) => {
  const tempNameKebab = tempPath.replace(/(src\/|\/scripts)/g, "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, (g) =>
    g[1].toUpperCase()
  );
  const jsPlugins = JSON.parse(fs.readFileSync(`${tempPath}/jsPlugins.json`));
  const srcPath = Object.values(jsPlugins);
  const destPath = tempPath.replace("src", "dist");
  const watchPath = `${tempPath}/jsPlugins.json`;

  templateJsPlugins.push({
    [`${tempNameCamel}_jsPlugins`]: () => {
      return src(srcPath)
        .pipe(concat("plugins.min.js"))
        .pipe(terser())
        .pipe(dest(destPath))
        .pipe(connect.reload())
        .pipe(notify(`✔️ ${tempNameKebab} js plugins task completed!`));
    },
    watchPath,
  });
});

module.exports = {
  templateJsPlugins,
};
