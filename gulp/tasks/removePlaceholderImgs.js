const { src, dest } = require("gulp");
const change = require("gulp-change");
const notify = require("gulp-notify");

function editPageContent(content) {
  const pattern = /(<a|<img)(.+)(\sdata-placeholder=".+?")(.*?>)/gm;
  return content.replace(pattern, "$1$2$4");
}

// templates remove placeholder images
const removePlaceholderImgs = () => {
  return src("dist/**/*.html")
    .pipe(change(editPageContent))
    .pipe(dest("dist"))
    .pipe(
      notify({
        message: "🗑️  Placeholder images removed!",
        onLast: true,
      })
    );
};

module.exports = {
  removePlaceholderImgs,
};
