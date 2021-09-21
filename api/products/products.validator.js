/* eslint-disable @typescript-eslint/no-var-requires */
const joi = require("@hapi/joi");

const fetchProductsSchema = joi.object({
  request: joi.string().required().allow("buyRequest", "sellRequest"),
  page: joi.string(),
  limit: joi.string()
});

module.exports = {
  fetchProductsSchema
};
