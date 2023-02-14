const { src, dest } = require("gulp");
const zip = require("gulp-zip");
const notify = require("gulp-notify");
const fs = require("fs");
const packageJson = JSON.parse(fs.readFileSync("./package.json"));

// templates zipper
const zipper = () => {
  return src("dist/**/*.*")
    .pipe(zip(`${packageJson.name}.zip`))
    .pipe(dest("dist"))
    .pipe(notify("📁  Files have been compressed!"));
};

module.exports = {
  zipper,
};
