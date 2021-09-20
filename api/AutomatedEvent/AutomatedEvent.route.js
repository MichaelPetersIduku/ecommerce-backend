const Router = require("express");
const { startDailyDeliveryBatchTask, stopDailyDeliveryBatchTask } = require("../../util/cron");
const { isAuthenticated, inputValidator } = require("../../util/middleware");

const automatedEventRouter = Router();

automatedEventRouter.post(
  "/deliverybatch/startDailyDeliveryBatchCreationJob",
  isAuthenticated,
  (req, res) => {
    startDailyDeliveryBatchTask();
    res.status(200).send("Successfully started job");
  }
);

automatedEventRouter.post(
  "/deliverybatch/stopDailyDeliveryBatchCreationJob",
  isAuthenticated,
  (req, res) => {
    stopDailyDeliveryBatchTask()
    res.status(200).send("Successfully ended job");
  }
);

module.exports = {
    automatedEventRouter
}