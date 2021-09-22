/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const {
  successResponse,
  serverErrorResponse,
  failureResponse,
} = require("../../@core/common/response");
const { reverseFormatAmount } = require("../../@core/common/universal");
const { BuyRequest, SellRequest } = require("../googlesheet/googlesheet.model");

const fetchBuyRequests = async (req) => {
  try {
    let { limit, page } = req.query;
    limit = Number(limit) || 10;
    page = Number(page) || 1;
    const query = {};
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
    const query = {};
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

const fetchRequestsService = async (req) => {
  try {
    const { request } = req.query;

    const response =
      request === "buyRequest"
        ? await fetchBuyRequests(req)
        : await fetchSellRequests(req);
    const { status, message, data } = response;

    if (status) return successResponse(message, data);
    return failureResponse(message, data);
  } catch (error) {
    return serverErrorResponse(req, error);
  }
};

const searchProductService = async (req) => {
  try {
    let { limit, page, min, max } = req.query;
    limit = Number(limit) || 10;
    page = Number(page) || 1;
    min = Number(min);
    max = Number(max)
    const options = {
      page,
      limit,
      sort: { createdAt: "desc" },
      collation: { locale: "en" },
    };

    const { searchString, request } = req.query;
    const searchStringArray = searchString.toLowerCase().split(",");
    const query = {
        $or: [
          { productName: { $in: searchStringArray } },
          { size: { $in: searchStringArray } },
          { price: { $in: searchStringArray } },
          { condition: { $in: searchStringArray } },
        ],
      };
    const dbData = request === "buyRequest"? await BuyRequest.paginate(query, options): await SellRequest.paginate(query, options);
    dbData.docs = dbData.docs.reverse();
    if (min) {
        dbData.docs = dbData.docs.filter(product => {
            const amount = reverseFormatAmount(product.price);
            return amount >= min; 
        })
    }
    if (max) {
        dbData.docs = dbData.docs.filter(product => {
            const amount = reverseFormatAmount(product.price);
            return amount <= max; 
        })
    }
    dbData.totalDocs = dbData.docs.length;
    return successResponse("Successful", dbData);
  } catch (error) {
    return serverErrorResponse(req, error);
  }
};

module.exports = {
  fetchRequestsService,
  searchProductService,
};
