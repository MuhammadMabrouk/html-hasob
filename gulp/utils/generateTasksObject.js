const { getTaskName } = require("./getTaskName");

const generateTasksObject = (tasksArr) => {
  return tasksArr.reduce((obj, task) => {
    const taskName = getTaskName(task);
    obj[taskName] = task[taskName];
    return obj;
  }, {});
};

module.exports = {
  generateTasksObject,
};
