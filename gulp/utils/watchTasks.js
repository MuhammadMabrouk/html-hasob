// watch() to watches changes to files and executes the task when a change occurs
const { watch } = require("gulp");
const { getTaskName } = require("./getTaskName");

// watch tasks from array
const watchTasks = (tasksArr) => {
  tasksArr.forEach((task) => {
    const taskName = getTaskName(task);
    watch(task.watchPath, task[taskName]);
  });
};

module.exports = {
  watchTasks,
};
