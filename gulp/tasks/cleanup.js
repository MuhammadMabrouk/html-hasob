const del = require("del");
const cached = require("gulp-cached");

// destination cleanup (dist)
const cleanup = () => {
  // clear all caches
  cached.caches = {};

  // delete dest folder [dist]
  return del("dist{,/**}");
};

module.exports = {
  cleanup,
};
