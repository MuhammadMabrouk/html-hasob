// parallel() to run them at concurrency
// watch() to watches changes to files and executes the task when a change occurs
const { parallel, watch } = require("gulp");

// plugin for webserver & LiveReload
const connect = require("gulp-connect");

// tasks
const { templateHtml }          = require("./gulp/tasks/templateHtml");
const { globalHtmlPages }       = require("./gulp/tasks/globalHtmlPages");
const { templateMainCss }       = require("./gulp/tasks/templateMainCss");
const { templateCssLibraries }  = require("./gulp/tasks/templateCssLibraries");
const { templateMainScript }    = require("./gulp/tasks/templateMainScript");
const { templateJsPlugins }     = require("./gulp/tasks/templateJsPlugins");
const { templateImgs }          = require("./gulp/tasks/templateImgs");
const { templateAssets }        = require("./gulp/tasks/templateAssets");
const { templateNpmAssets }     = require("./gulp/tasks/templateNpmAssets");
const { fontAwesomeFonts }      = require("./gulp/tasks/fontAwesomeFonts");
const { phpFiles }              = require("./gulp/tasks/phpFiles");
const { cleanup }               = require("./gulp/tasks/cleanup");
const { zipper }                = require("./gulp/tasks/zipper");
const { build }                 = require("./gulp/tasks/build");
const { themeforest_build }     = require("./gulp/tasks/build");

// utils functions
const { watchTasks }            = require("./gulp/utils/watchTasks");
const { generateTasksObject }   = require("./gulp/utils/generateTasksObject");

// watcher task
const watcher = (cb) => {
  connect.server({
    root: "./dist/",
    livereload: true,
  });

  // template html task
  watchTasks(templateHtml);

  // global html pages task
  watchTasks(globalHtmlPages);

  // template main css task
  watchTasks(templateMainCss);

  // template css libraries task
  watchTasks(templateCssLibraries);

  // template main script task
  watchTasks(templateMainScript);

  // template js plugins task
  watchTasks(templateJsPlugins);

  // template images task
  watchTasks(templateImgs);

  // template main assets task
  watchTasks(templateAssets);

  // template npm assets task
  watchTasks(templateNpmAssets);

  // template font-awesome fonts task
  watchTasks(fontAwesomeFonts);

  // php global files task
  watch("src/*.php", phpFiles);

  cb();
};

// export public tasks to be run by the gulp command
module.exports = {
  ...generateTasksObject(templateHtml),
  ...generateTasksObject(globalHtmlPages),
  ...generateTasksObject(templateMainCss),
  ...generateTasksObject(templateCssLibraries),
  ...generateTasksObject(templateMainScript),
  ...generateTasksObject(templateJsPlugins),
  ...generateTasksObject(templateImgs),
  ...generateTasksObject(templateAssets),
  ...generateTasksObject(templateNpmAssets),
  ...generateTasksObject(fontAwesomeFonts),
  phpFiles,
  cleanup,
  zipper,
  build,
  themeforest_build,

  // default task
  default: parallel(watcher),
};
