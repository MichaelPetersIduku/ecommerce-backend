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
      // sort: { createdAt: "desc" },
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
      // sort: { createdAt: "desc" },
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
    let { min, max } = req.query;
    // limit = Number(limit) || 10;
    // page = Number(page) || 1;
    min = Number(min);
    max = Number(max);

    const { searchString, request, category } = req.query;
    let query = {};
    if (searchString) {
    const searchStrArry = searchString.toLowerCase().split(",");
    const searchStringArray = [];
    searchStrArry.forEach(str => {
      searchStringArray.push(str.trim())
    })
    console.log(searchStringArray);
    query = {
      $or: [
        { productName: { $regex: searchString, $options: "i" } },
        { size: { $in: searchStringArray } },
        { price: { $in: searchStringArray } },
        { condition: { $in: searchStringArray } },
      ],
    };
  }
  if (category) {
    query = {
         productName: category
    };
  }
    let dbData =
      request === "buyRequest"
        ? await BuyRequest.find(query)
        : await SellRequest.find(query);
    if (min) {
      dbData = dbData.filter((product) => {
        const amount = reverseFormatAmount(product.price);
        return amount >= Number(min);
      });
    }
    if (max) {
      dbData = dbData.filter((product) => {
        const amount = reverseFormatAmount(product.price);
        return amount <= Number(max);
      });
    }
    return successResponse("Successful", dbData);
  } catch (error) {
    return serverErrorResponse(req, error);
  }
};

const fetchAllCategoryService = async (req) => {
  try {
    const category = await (
      await BuyRequest.find().distinct("productName")
    ).reverse();
    return successResponse("Successful", category);
  } catch (error) {
    return serverErrorResponse(req, error);
  }
};

module.exports = {
  fetchRequestsService,
  searchProductService,
  fetchAllCategoryService,
};
