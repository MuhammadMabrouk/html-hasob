const { src, dest } = require("gulp");
const fs = require("fs");
const glob = require("glob");
const mergeStream = require("merge-stream");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template npm assets
const templateNpmAssets = [];
glob.sync("src/template-*/assets").forEach((tempPath) => {
  const tempNameKebab = tempPath.replace(/(src\/|\/assets)/g, "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, (g) =>
    g[1].toUpperCase()
  );
  const npmAssets = JSON.parse(fs.readFileSync(`${tempPath}/npmAssets.json`));
  const stylesSrcPath = Object.values(npmAssets.styles);
  const scriptsSrcPath = Object.values(npmAssets.scripts);
  const stylesDestPath = `dist/${tempNameKebab}/styles`;
  const scriptsDestPath = `dist/${tempNameKebab}/scripts`;
  const watchPath = `${tempPath}/npmAssets.json`;

  templateNpmAssets.push({
    [`${tempNameCamel}_npmAssets`]: () => {
      const assets = [];

      // styles assets
      stylesSrcPath.length && assets.push(
        src(stylesSrcPath, { allowEmpty: true })
          .pipe(dest(stylesDestPath))
      );

      // scripts assets
      scriptsSrcPath.length && assets.push(
        src(scriptsSrcPath, { allowEmpty: true })
          .pipe(dest(scriptsDestPath))
      );

      return mergeStream(...assets)
        .pipe(connect.reload())
        .pipe(notify({
          message: `✔️ ${tempNameKebab} npm assets task completed!`,
          onLast: true,
        }));
    },
    watchPath,
  });
});

module.exports = {
  templateNpmAssets,
};
