const { logger } = require('firebase-functions');
const cron = require('node-cron');
const { createDailyDeliveryBatchJob } = require('../jobs/deliverybatch.job');
let deliveryBatchTask;

const startDailyDeliveryBatchTask = async () => {
    logger.log("Running job");
    deliveryBatchTask = cron.schedule('0 0 * * *', async () => {
    await createDailyDeliveryBatchJob();
});
}

const stopDailyDeliveryBatchTask = async () => {
    deliveryBatchTask && deliveryBatchTask.stop();
}

module.exports = {
    startDailyDeliveryBatchTask,
    stopDailyDeliveryBatchTask
}