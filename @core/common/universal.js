const { logger } = require("firebase-functions");
const fetch = require("node-fetch");
const {
  APPSHEET_BASEURL,
  WAREHOUSE_APPID,
  WAREHOUSE_ACCESSTOKEN,
} = require("./credentials");

const apiCall = async (api, body, headers, method) => {
  try {
    const payLoad = { headers, method };
    body ? (payLoad.body = JSON.stringify(body)) : payLoad;
    logger.log("PAYLOAD", payLoad);
    const result = await fetch(api, payLoad);
    logger.log("RESULT", result);
    return result;
  } catch (error) {
    logger.error(error);
    return { request: { api, body, headers, method }, error };
  }
};

const getRecordsAppSheet = async (tableName, selector) => {
  let url = `${APPSHEET_BASEURL}/${WAREHOUSE_APPID}/tables/${tableName}/Action`;
  logger.log(url);
  const body = {
    Action: "Find",
    Properties: {
      Locale: "en-US",
      Timezone: "Pacific Standard Time",
      Selector: selector,
      UserSettings: {
        "Option 1": "value1",
        "Option 2": "value2",
      },
    },
    Rows: [],
  };
  logger.log(body);
  const HEADER = {
    applicationAccessKey: WAREHOUSE_ACCESSTOKEN,
    "Content-Type": "application/json",
  };
  const response = await apiCall(url, body, HEADER, "POST");
  const rows = await response.json();
  return rows;
};

const updateRecordsAppSheet = async (tableName, rowsToUpdate) => {
  let url = `${APPSHEET_BASEURL}/${WAREHOUSE_APPID}/tables/${tableName}/Action`;
  const body = {
    Action: "Edit",
    Properties: {
      Locale: "en-US",
      Timezone: "Pacific Standard Time",
      UserSettings: {
        "Option 1": "value1",
        "Option 2": "value2",
      },
    },
    Rows: rowsToUpdate,
  };
  logger.log(body);
  const HEADER = {
    applicationAccessKey: WAREHOUSE_ACCESSTOKEN,
    "Content-Type": "application/json",
  };
  let response = await apiCall(url, body, HEADER, "POST");
  logger.log(response);
  if (!response) response = {};
  const rows = await response.json();
  return rows;
};

const addRecordsAppSheet = async (tableName, rowsToAdd) => {
  let url = `${APPSHEET_BASEURL}/${WAREHOUSE_APPID}/tables/${tableName}/Action`;
  const body = {
    Action: "Add",
    Properties: {
      Locale: "en-US",
      Timezone: "Pacific Standard Time",
      UserSettings: {
        "Option 1": "value1",
        "Option 2": "value2",
      },
    },
    Rows: rowsToAdd,
  };
  logger.log(body);
  const HEADER = {
    applicationAccessKey: WAREHOUSE_ACCESSTOKEN,
    "Content-Type": "application/json",
  };
  const response = await apiCall(url, body, HEADER, "POST");
  // const rows = await response.json();
  return response;
};

module.exports = {
  apiCall,
  getRecordsAppSheet,
  updateRecordsAppSheet,
  addRecordsAppSheet,
};
