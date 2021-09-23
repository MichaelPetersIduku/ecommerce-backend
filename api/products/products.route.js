/* eslint-disable @typescript-eslint/no-var-requires */
const Router = require("express");
const { isAuthenticated, inputValidator } = require("../../util/middleware");
const { fetchRequestsController, searchProductsController, fetchAllCategoryController } = require("./products.controller");
const { fetchProductsSchema, searchProductsSchema } = require("./products.validator");

const productsRouter = Router();

productsRouter.get(
  "/",
  isAuthenticated,
  inputValidator({query: fetchProductsSchema}),
  fetchRequestsController
);

productsRouter.get(
  "/category",
  isAuthenticated,
  fetchAllCategoryController
)

productsRouter.get(
    "/search",
    isAuthenticated,
    inputValidator({query: searchProductsSchema}),
    searchProductsController
)

module.exports = {
  productsRouter,
};
