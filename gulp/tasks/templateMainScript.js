const { dest } = require("gulp");
const glob = require("glob");
const rollup = require("@rollup/stream");
const commonjs = require("@rollup/plugin-commonjs"); // require() syntax support
const { nodeResolve } = require("@rollup/plugin-node-resolve"); // importing from node_modules support
const { babel } = require("@rollup/plugin-babel"); // convert ES6 to ES5
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const beautify = require("gulp-jsbeautifier");
const terser = require("gulp-terser");
const mergeStream = require("merge-stream");
const connect = require("gulp-connect");
const notify = require("gulp-notify");

// template main script
const templateMainScript = [];
glob.sync("src/template-*/scripts").forEach((tempPath) => {
  const tempNameKebab = tempPath.replace(/(src\/|\/scripts)/g, "");
  const tempNameCamel = tempNameKebab.replace(/-([a-z])/g, (g) =>
    g[1].toUpperCase()
  );
  const srcPath = `${tempPath}/main.js`;
  const destPath = tempPath.replace("src", "dist");
  const watchPath = [
    `${tempPath}/*.js`,
    `src/${tempNameKebab}/components/**/*.js`,
    `src/${tempNameKebab}/ui/**/*.js`,
    "src/pages/**/*.js",
  ];

  // Cache needs to be initialized outside of the Gulp task
  const cache = { dev: null, prod: null };

  // common steps between development & production versions
  function CommonSteps(mode) {
    const outputFileName = mode === "dev" ? "script.js" : "script.min.js";
    const sourcemap = mode === "dev" ? true : false;

    return (
      rollup({
        // Point to the entry file
        input: srcPath,

        // Apply plugins
        plugins: [
          commonjs(),
          nodeResolve(),
          babel({ babelHelpers: "bundled", retainLines: true }),
        ],

        // Use cache for better performance
        cache: cache[mode],

        output: {
          // Output bundle is intended for use in browsers
          // (iife = "Immediately Invoked Function Expression")
          format: "iife",

          // Show source code when debugging in browser
          sourcemap,
        },
      })
        .on("bundle", function (bundle) {
          // Update cache data after every bundle is created
          cache[mode] = bundle;
        })
        // Name of the output file.
        .pipe(source(outputFileName))
        .pipe(buffer())
    );
  }

  templateMainScript.push({
    [`${tempNameCamel}_mainScript`]: () => {
      // development version
      const dev_mainScript = new CommonSteps("dev").pipe(beautify({
        indent_size: 2,
        end_with_newline: true
      }));

      // production version
      const prod_mainScript = new CommonSteps("prod").pipe(terser());

      return mergeStream(dev_mainScript, prod_mainScript)
        .pipe(dest(destPath))
        .pipe(connect.reload())
        .pipe(
          notify({
            message: `✔️ ${tempNameKebab} main script task completed!`,
            onLast: true,
          })
        );
    },
    watchPath,
  });
});

module.exports = {
  templateMainScript,
};
