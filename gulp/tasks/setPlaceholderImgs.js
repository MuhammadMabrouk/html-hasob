const { src, dest } = require("gulp");
const change = require("gulp-change");
const notify = require("gulp-notify");

function editPageContent(content) {
  const pattern = /(<a|<img)(.+)(href="|src=")(.+?)(".+)(data-placeholder="(.+?)")(.*?>)/gm;
  return content.replace(pattern, "$1$2$3https://via.placeholder.com/$7$5$8");
}

// templates set placeholder images
const setPlaceholderImgs = () => {
  return src("dist/**/*.html")
    .pipe(change(editPageContent))
    .pipe(dest("dist"))
    .pipe(
      notify({
        message: "📷  Placeholder images are set!",
        onLast: true,
      })
    );
};

module.exports = {
  setPlaceholderImgs,
};
