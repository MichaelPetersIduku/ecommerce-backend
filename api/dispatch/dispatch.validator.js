const joi = require("@hapi/joi");

const createBatchSchema = joi.object({
  date: joi.string().required(),
  deliveryAssociatePhone: joi.string(),
});

const batchAssignmentSchema = joi.object({
  deliveryAssociate: joi.string().required(),
  driver: joi.string().required().allow(""),
  tagDate: joi.string().required(),
  deliveryBatchNumber: joi.string().required(),
  packages: joi.string().required()
})

const createShipmentSchema = joi.object({
  packageId: joi.string().required(),
  packageNo: joi.string().required(),
  carrier: joi.string().required(),
  daCode: joi.string().required(),
  driverCode: joi.string().required(),
});

module.exports = {
  createBatchSchema,
  createShipmentSchema,
  batchAssignmentSchema
};
