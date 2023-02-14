const { src, dest } = require("gulp");
const glob = require("glob");
const changed = require("gulp-changed");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// global php files
const phpFiles = () => {
  let stream = src("src/*.php");

  glob.sync("src/template-*").forEach((tempPath) => {
    const destPath = tempPath.replace("src", "dist");

    stream = stream.pipe(changed(destPath)).pipe(dest(destPath));
  });

  return stream
    .pipe(connect.reload())
    .pipe(notify("✔️ PHP global files task completed!"));
};

module.exports = {
  phpFiles,
};
