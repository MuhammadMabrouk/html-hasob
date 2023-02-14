const { src, dest } = require("gulp");
const glob = require("glob");
const fileInclude = require("gulp-file-include");
const i18n = require("gulp-html-i18n");
const beautify = require("gulp-jsbeautifier");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template html
const templateHtml = [];
glob.sync("src/template-*").forEach((tempPath) => {
  const tempNameKebab = tempPath.replace("src/", "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, (g) =>
    g[1].toUpperCase()
  );
  const srcPath = `${tempPath}/*.html`;
  const destPath = tempPath.replace("src", "dist");
  const watchPath = [
    srcPath,
    "src/**/schema/*.html",
    "src/**/components/**/*.html",
    "src/**/ui/**/*.html",
    `${tempPath}/assets/i18n/**/*.json`,
  ];

  templateHtml.push({
    [`${tempNameCamel}_mainHtml`]: () => {
      return src(srcPath)
        .pipe(fileInclude({ basepath: tempPath }))
        .pipe(
          i18n({
            langDir: `./${tempPath}/assets/i18n`,
            filenameI18n: true,
          })
        )
        .pipe(beautify({
          indent_size: 2,
          wrap_attributes: "preserve",
          end_with_newline: true
        }))
        .pipe(dest(destPath))
        .pipe(connect.reload())
        .pipe(
          notify({
            message: `✔️ ${tempNameKebab} main html task completed!`,
            onLast: true,
          })
        );
    },
    watchPath,
  });
});

module.exports = {
  templateHtml,
};
