const patenaService = require("./patena/patenaService");
const Task = require("../model/schema/Task");
const translationService = require("./translationService");
const constants = require("./constants");
const logger = require("./log/logService");
const fse = require("fs-extra");
const fs = require("fs");

async function updateTaskState(task, state) {
  task.stateId = state;
  task.lastExecutionDate = Date.now();
  await task.save();
  return task;
}

async function addResultsTo(task) {
  const directory = "./workers/Output/" + task.id;
  logger.log("[Task Service] addResultsTo directory: " + directory);
  const result = JSON.parse(fs.readFileSync(directory + "/results.json", "utf8"));
  logger.log("[Task Service] addResultsTo result: " + JSON.stringify(result));
  if (result) {
    task.output = result;
    task.attempts = task.attempts + 1;
    task.stateId = constants.TASK_STATE_FINISHED;
    logger.log("[Task Service] addResultsTo saving task: " + task.id);
    await task.save();
    logger.log("[Task Service] addResultsTo after saving task: " + task.id);
    fse.removeSync(directory);
    logger.log("[Task Service] addResultsTo after removeSync directory: " + directory);
  }
  logger.log("[Task Service] exiting addResultsTo");
}

module.exports = {
  create: async function (id, taskData, typeId) {
    let task;
    try {
      task = new Task({
        id: id,
        stateId: constants.TASK_STATE_PENDING,
        typeId: typeId,
        taskData: taskData,
        language: taskData.language,
      });
      await task.save();
    } catch (error) {
      logger.error("Error creating a new Task: " + JSON.stringify(taskData));
      logger.error(error);
      return error;
    }
  },
  getTask: async function (taskId) {
    const tasks = await Task.find({
      id: taskId,
    });
    return tasks.length > 0 ? tasks[0] : undefined;
  },
  getTaskInProgress: async function () {
    const tasks = await Task.find({
      stateId: constants.TASK_STATE_IN_PROGRESS,
    });
    return tasks.length > 0 ? tasks[0] : undefined;
  },
  promoteTaskToInProgress: async function (task) {
    return updateTaskState(task, constants.TASK_STATE_IN_PROGRESS);
  },
  updateFailingTask: async function (task, error) {
    task.attempts = task.attempts + 1;
    task.messageError = error;
    let nextState = constants.TASK_STATE_PENDING;
    if (task.attempts > 2) {
      nextState = constants.TASK_STATE_CANCELLED;
    }
    return updateTaskState(task, nextState);
  },
  cancelTask: async function (task) {
    const translations = translationService.getTranslationsIn(task.language);
    task.messageError = translations.taskService.cancelMessageError;
    return updateTaskState(task, constants.TASK_STATE_CANCELLED);
  },
  getNextPendingTask: async function () {
    const tasks = await Task.find({
      stateId: constants.TASK_STATE_PENDING,
    })
      .sort({
        creationDate: "asc",
      })
      .limit(1);
    return tasks.length > 0 ? tasks[0] : undefined;
  },
  taskIsCancelled: function (task) {
    return task.stateId === constants.TASK_STATE_CANCELLED;
  },
  updateSentEmailNotification: async function (task) {
    task.emailSent = true;
    task.sentEmailDate = new Date();
    await task.save();
    return task;
  },
  runTask: async function (task) {
    await patenaService.start(task);
    logger.log("[Task Service] calling addResultsTo for: " + task.id);
    await addResultsTo(task);
    logger.log("[Task Service] exiting runTask for: " + task.id);
  },
};
