const { SPREADSHEET_DOC } = require("../../@core/common/credentials");

const {
  successResponse,
  serverErrorResponse,
  failureResponse,
} = require("../../@core/common/response");
const { BuyRequest, SellRequest } = require("../googlesheet/googlesheet.model");

const fetchRequestsService = async (req) => {
  try {
    const { request } = req.query;

    const response = request == "buyRequest"? await fetchBuyRequests(req) : await fetchSellRequests(req);
    const {status, message, data} = response;
    
    if (status) return successResponse(message, data);
    return failureResponse(message, data);
  } catch (error) {
    return serverErrorResponse(req, error);
  }
};

const fetchBuyRequests = async (req) => {
  try {
    let { limit, page } = req.query;
    limit = Number(limit) || 10;
    page = Number(page) || 1;
    let query = {};
    const options = {
      page,
      limit,
      sort: { createdAt: "desc" },
      collation: { locale: "en" },
    };
    const buyRequests = await BuyRequest.paginate(query, options);
    return successResponse("Successful", buyRequests);
  } catch (error) {
    return serverErrorResponse(req, error);
  }
};

const fetchSellRequests = async (req) => {
  try {
    let { limit, page } = req.query;
    limit = Number(limit) || 10;
    page = Number(page) || 1;
    let query = {};
    const options = {
      page,
      limit,
      sort: { createdAt: "desc" },
      collation: { locale: "en" },
    };
    const sellRequests = await SellRequest.paginate(query, options);
    return successResponse("Successful", sellRequests);
  } catch (error) {
    return serverErrorResponse(req, error);
  }
};

module.exports = {
  fetchRequestsService,
};
