const joi = require("@hapi/joi");

const getAllSpreadsheetDataSchema = joi.object({
  lastItem: joi.number().min(1),
  status: joi
    .string()
    .valid("Partially packed", "Cancelled", "Packed", "Ongoing", "Open"),
});

const deliveryActionSchema = joi.object({
  deliveryStatus: joi
    .string()
    .valid(
      "Reschedule",
      "Fully Delivered",
      "Fully Rejected",
      "Partially Delivered"
    ),
  deliveryBatchNumber: joi.string().required(),
  deliveries: joi.string().required().allow(""),
  deliveries2: joi.string().required().allow(""),
  deliveries3: joi.string().required().allow(""),
  reason: joi.string().allow(""),
});

const financeRecoSchema = joi.object({
  deliveryBatchNumber: joi.string().required(),
  deliveryStatus: joi
    .string()
    .valid("Fully Delivered", "Partially Delivered")
    .required(),
  paymentType: joi.string().valid("Full", "Mixed").required(),
  deliveries: joi.string().required().allow(""),
  deliveries2: joi.string().required().allow(""),
  deliveries3: joi.string().required().allow(""),
  paymentMethod: joi.string().required(),
  accountName: joi.string().allow(""),
  accountId: joi.string().allow(""),
  referenceNo: joi.string().allow(""),
  comments: joi.string().allow(""),
  paymentId: joi.string().allow(""),
  paymentDate: joi.string().allow(""),
  createdAt: joi.string().allow(""),
  createdBy: joi.string().allow("")
});

const cancelReturnSchema = joi.object({
  packageNo: joi.string().required(),
  packageId: joi.string().required(),
  deliveryBatchNumber: joi.string().required(),
  status: joi.string().required(),
  deliveryStatus: joi.string().required(),
});

const returnSchema = joi.object({
  packageNo: joi.string().required(),
  deliveryBatchNumber: joi.string().required(),
  returnCount: joi.string().valid("Complete", "Incomplete").required(),
  returnValue: joi.string().required(),
  reason: joi.string().allow(""),
  deliveryStatus: joi.string().required(),
});

// exports.getAllSpreadsheetDataSchema = getAllSpreadsheetDataSchema;
// exports.deliveryActionSchema = deliveryActionSchema;
// exports.returnSchema = returnSchema;
// exports.financeRecoSchema = financeRecoSchema;
module.exports = {
  getAllSpreadsheetDataSchema,
  deliveryActionSchema,
  returnSchema,
  financeRecoSchema,
  cancelReturnSchema,
};
