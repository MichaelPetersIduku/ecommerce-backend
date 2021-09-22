/* eslint-disable @typescript-eslint/no-var-requires */
const joi = require("@hapi/joi");

const fetchProductsSchema = joi.object({
  request: joi.string().required().allow("buyRequest", "sellRequest"),
  page: joi.string(),
  limit: joi.string()
});

const searchProductsSchema = joi.object({
    searchString: joi.string().required(),
    request: joi.string().required().allow("buyRequest", "sellRequest"),
    limit: joi.string(),
    page: joi.string(),
    min: joi.string(),
    max: joi.string()
})

module.exports = {
  fetchProductsSchema,
  searchProductsSchema
};
