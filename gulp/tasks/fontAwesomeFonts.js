const { src, dest } = require("gulp");
const glob = require("glob");
const changed = require("gulp-changed");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template font-awesome fonts
const fontAwesomeFonts = [];
glob.sync("src/template-*/assets").forEach((tempPath) => {
  const tempNameKebab = tempPath.replace(/(src\/|\/assets)/g, "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, (g) =>
    g[1].toUpperCase()
  );
  const srcPath = "node_modules/font-awesome/fonts/*";
  const destPath = `${tempPath.replace("src", "dist")}/fonts`;
  const watchPath = srcPath;

  fontAwesomeFonts.push({
    [`${tempNameCamel}_fontAwesomeFonts`]: () => {
      return src(srcPath)
        .pipe(changed(destPath))
        .pipe(dest(destPath))
        .pipe(connect.reload())
        .pipe(
          notify({
            message: `✔️ ${tempNameKebab} font-awesome fonts task completed!`,
            onLast: true,
          })
        );
    },
    watchPath,
  });
});

module.exports = {
  fontAwesomeFonts,
};
