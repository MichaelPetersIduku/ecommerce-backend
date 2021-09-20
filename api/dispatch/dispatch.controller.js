const { logger } = require("firebase-functions");
const { controllerResponseHandler, controllerErrorHandler } = require("../../@core/common/response");
const { createDeliveryBatchService, createShipmentService, deliveryBatchAssignmentService } = require("./dispatch.service");

const createDeliveryBatchController = async (req, res) => {
  try {
    const response = await createDeliveryBatchService(req);
    controllerResponseHandler(response, res);
  } catch (error) {
    logger.error(error);
    controllerErrorHandler(error, res);
  }
};

const deliveryBatchAssignmentController = async (req, res) => {
  try {
    const response = await deliveryBatchAssignmentService(req);
    controllerResponseHandler(response, res);
  } catch (error) {
    logger.error(error);
    controllerErrorHandler(error, res);
  }
};

const createShipmentController = async (req, res) => {
  try {
    const response = await createShipmentService(req);
    controllerResponseHandler(response, res);
  } catch (error) {
    logger.error(error);
    controllerErrorHandler(error, res);
  }
};

module.exports = {
  createDeliveryBatchController,
  createShipmentController,
  deliveryBatchAssignmentController
};
