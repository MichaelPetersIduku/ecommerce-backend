const Router = require("express");
const { isAuthenticated, inputValidator } = require("../../util/middleware");
const { createBatchSchema, createShipmentSchema, batchAssignmentSchema } = require("./dispatch.validator");
const { createDeliveryBatchController, createShipmentController, deliveryBatchAssignmentController } = require("./dispatch.controller");
const dispatchRouter = Router();

dispatchRouter.post(
  "/deliverybatch/create",
  isAuthenticated,
  inputValidator({ body: createBatchSchema }),
  createDeliveryBatchController
);

dispatchRouter.post(
  "/deliverybatch/assignment",
  isAuthenticated,
  inputValidator({ body: batchAssignmentSchema}),
  deliveryBatchAssignmentController
)

dispatchRouter.post(
  "/shipment/create",
  isAuthenticated,
  inputValidator({body: createShipmentSchema}),
  createShipmentController
);

module.exports = {
  dispatchRouter: dispatchRouter,
};
