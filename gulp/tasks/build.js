const { parallel, series } = require("gulp");

// tasks
const { templateHtml }          = require("./templateHtml");
const { globalHtmlPages }       = require("./globalHtmlPages");
const { templateMainCss }       = require("./templateMainCss");
const { templateCssLibraries }  = require("./templateCssLibraries");
const { templateMainScript }    = require("./templateMainScript");
const { templateJsPlugins }     = require("./templateJsPlugins");
const { templateImgs }          = require("./templateImgs");
const { templateAssets }        = require("./templateAssets");
// const { templateNpmAssets }     = require("./templateNpmAssets");
const { fontAwesomeFonts }      = require("./fontAwesomeFonts");
const { phpFiles }              = require("./phpFiles");
const { removePlaceholderImgs } = require("./removePlaceholderImgs");
const { setPlaceholderImgs }    = require("./setPlaceholderImgs");
const { cleanup }               = require("./cleanup");
const { zipper }                = require("./zipper");

// utils functions
const { generateTasksObject } = require("../utils/generateTasksObject");

// common tasks
const commonTasks = parallel(
  Object.values(generateTasksObject(templateHtml)),
  Object.values(generateTasksObject(globalHtmlPages)),
  Object.values(generateTasksObject(templateMainCss)),
  Object.values(generateTasksObject(templateCssLibraries)),
  Object.values(generateTasksObject(templateMainScript)),
  Object.values(generateTasksObject(templateJsPlugins)),
  Object.values(generateTasksObject(templateImgs)),
  Object.values(generateTasksObject(templateAssets)),
  // Object.values(generateTasksObject(templateNpmAssets)),
  Object.values(generateTasksObject(fontAwesomeFonts)),
  phpFiles
);

// build all files to dist folder
const build = series(
  cleanup,
  commonTasks,
  removePlaceholderImgs,
  zipper
);

// build all files for themeforest to dist folder
const themeforest_build = series(
  cleanup,
  commonTasks,
  setPlaceholderImgs,
  zipper
);

module.exports = {
  build,
  themeforest_build,
};
