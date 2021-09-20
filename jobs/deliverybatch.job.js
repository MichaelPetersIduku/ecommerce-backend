const { logger } = require('firebase-functions');

const createDailyDeliveryBatchJob = async () => {
    logger.log("Creating Delivery Batch every day at 00:00:00");
}

module.exports = {
    createDailyDeliveryBatchJob
}