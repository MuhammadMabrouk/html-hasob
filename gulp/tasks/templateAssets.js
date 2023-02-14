const { src, dest } = require("gulp");
const glob = require("glob");
const changed = require("gulp-changed");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template assets
const templateAssets = [];
glob.sync("src/template-*/assets").forEach((tempPath) => {
  const tempNameKebab = tempPath.replace(/(src\/|\/assets)/g, "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, (g) =>
    g[1].toUpperCase()
  );
  const srcPath = [
    `${tempPath}/**/*`,
    `!${tempPath}/images{,/**}`,
    `!${tempPath}/i18n{,/**}`,
    `!${tempPath}/npmAssets.json`,
  ];
  const destPath = tempPath.replace("src", "dist");
  const watchPath = srcPath;

  templateAssets.push({
    [`${tempNameCamel}_assets`]: () => {
      return src(srcPath, { allowEmpty: true })
        .pipe(changed(destPath))
        .pipe(dest(destPath))
        .pipe(connect.reload())
        .pipe(
          notify({
            message: `✔️ ${tempNameKebab} assets task completed!`,
            onLast: true,
          })
        );
    },
    watchPath,
  });
});

module.exports = {
  templateAssets,
};
