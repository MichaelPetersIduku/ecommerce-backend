/* eslint-disable @typescript-eslint/no-var-requires */
const { controllerResponseHandler, controllerErrorHandler } = require("../../@core/common/response");
const { fetchRequestsService } = require("./products.service");

const fetchRequestsController = async (req, res) => {
  try {
    const response = await fetchRequestsService(req);
    controllerResponseHandler(response, res);
  } catch (error) {
    controllerErrorHandler(error, res);
  }
};

module.exports = {
    fetchRequestsController,
};
