const { src, dest } = require("gulp");
const glob = require("glob");
const changed = require("gulp-changed");
const image = require("gulp-image");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template images
const templateImgs = [];
glob.sync("src/template-*/assets/images").forEach((tempPath) => {
  const tempNameKebab = tempPath.replace(/(src\/|\/assets\/images)/g, "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, (g) =>
    g[1].toUpperCase()
  );
  const srcPath = `${tempPath}/**/*.*`;
  const destPath = tempPath.replace("src", "dist");
  const watchPath = srcPath;

  templateImgs.push({
    [`${tempNameCamel}_imgs`]: () => {
      return src(srcPath)
        .pipe(changed(destPath))
        .pipe(image())
        .pipe(dest(destPath))
        .pipe(connect.reload())
        .pipe(
          notify({
            message: `✔️ ${tempNameKebab} images task completed!`,
            onLast: true,
          })
        );
    },
    watchPath,
  });
});

module.exports = {
  templateImgs,
};
