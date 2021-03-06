/* eslint-disable @typescript-eslint/no-var-requires */
const { controllerResponseHandler, controllerErrorHandler } = require("../../@core/common/response");
const { fetchRequestsService, searchProductService, fetchAllCategoryService } = require("./products.service");

const fetchRequestsController = async (req, res) => {
  try {
    const response = await fetchRequestsService(req);
    controllerResponseHandler(response, res);
  } catch (error) {
    controllerErrorHandler(error, res);
  }
};

const searchProductsController = async (req, res) => {
    try {
      const response = await searchProductService(req);
      controllerResponseHandler(response, res);
    } catch (error) {
      controllerErrorHandler(error, res);
    }
  };

  const fetchAllCategoryController = async (req, res) => {
    try {
      const response = await fetchAllCategoryService(req);
      controllerResponseHandler(response, res);
    } catch (error) {
      controllerErrorHandler(error, res);
    }
  };

module.exports = {
    fetchRequestsController,
    searchProductsController,
    fetchAllCategoryController
};
