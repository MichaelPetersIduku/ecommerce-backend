/* eslint-disable @typescript-eslint/no-var-requires */
const Router = require("express");
const { isAuthenticated, inputValidator } = require("../../util/middleware");
const { fetchRequestsController } = require("./products.controller");
const { fetchProductsSchema } = require("./products.validator");

const productsRouter = Router();

productsRouter.get(
  "/",
  isAuthenticated,
  inputValidator({query: fetchProductsSchema}),
  fetchRequestsController
);

module.exports = {
  productsRouter,
};
