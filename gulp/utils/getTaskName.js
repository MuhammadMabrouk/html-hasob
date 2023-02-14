// get task name from object
const getTaskName = (taskObj) =>
  Object.keys(taskObj).find((item) => item !== "watchPath");

module.exports = {
  getTaskName,
};
