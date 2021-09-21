const { SPREADSHEET_DOC } = require("../../@core/common/credentials");
const { promisify } = require("util");
const GoogleSpreadsheet = require("google-spreadsheet");
const creds = require("../../@core/google-credentials/client_secret.json");

const { google } = require("googleapis");

const {
  successResponse,
  serverErrorResponse,
  failureResponse,
} = require("../../@core/common/response");
const { BuyRequest, SellRequest } = require("./googlesheet.model");

const saveDataToDBFromSheetService = async (req) => {
  const {scriptToRun} = req.query;
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "@core/google-credentials/client_secret.json", //the key file
      //url to spreadsheets API
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({
      version: "v4",
      auth: authClientObject,
    });
    const readData = await googleSheetsInstance.spreadsheets.values.get({
      auth, //auth object
      spreadsheetId: SPREADSHEET_DOC, // spreadsheet id
      range: "IPHONES", //range of cells to read from.
    });
    
    const rawData = readData.data;
    let data = rawData.values;
    data = removeAllEmptyStringIn2DArray(data);
    const dbData = scriptToRun == "buyRequestScript"? await runBuyRequestScript(data) : await runSellRequestScript(data);
    if (dbData) return successResponse("Successful", dbData);
    return failureResponse("Failed to save to database", {})
  } catch (error) {
    return serverErrorResponse(req, error);
  }
};

const removeAllEmptyStringIn2DArray = (array) => {
  for (let i = 0; i < array.length; i++) {
    array[i] = array[i].filter((item) => item);
  }
  return array;
};

const runBuyRequestScript = async (data) => {
  let buyRequestData = {};
  let buyRequest = [];

  for (let i = 2; i < data.length; i++) {
    let productName = data[i][0];
    if (data[i].length == 2) {
      for (let j = i+2; j < data.length; j++) {
        if (data[j].length != 2) {
          let productConditionArray = data[i+1].join().split("Storage Size")[1].split(",");
          productConditionArray = productConditionArray.filter(item => item);
          console.log(productConditionArray);
          let str = data[j].join("!-!");
          data[j] = str.includes("Unlocked")? str.split("Unlocked")[1].split("!-!"): str.split("!-!").slice(0, 9);
        data[j] = data[j].filter(item => item);
        let newArray = data[j];
          for (let k=0; k<newArray.length; k++) {
            if (data[j][0] == "Storage Size") continue;
          if (k != 0) {
            buyRequestData.productName = productName;
            buyRequestData.size = data[j][0];
            buyRequestData.price = newArray[k];
            buyRequestData.condition = productConditionArray[k-1];
            buyRequest.push(buyRequestData);
            buyRequestData = {};
          }
        }
      } else {
        break;
      }
      }
    };
  }

  const dbData = await BuyRequest.insertMany(buyRequest);
  return dbData;
}

const runSellRequestScript = async (data) => {
  let sellRequestData = {};
  let sellRequest = [];

  console.log(data);
  for (let i = 2; i < data.length; i++) {
    let productName = data[i][1];
    if (data[i].length == 2) {
      for (let j = i+2; j < data.length; j++) {
        if (data[j].length != 2) {
          let productConditionArray = data[i+1].join().split("Storage Size")[2].split(",");
          productConditionArray = productConditionArray.filter(item => item);
          console.log(productConditionArray);
          let str = data[j].join("!-!");
          data[j] = str.includes("Unlocked")? str.split("Unlocked")[2].split("!-!"): str.split("!-!").slice(9, 24);
        data[j] = data[j].filter(item => item);
        let newArray = data[j];
          for (let k=0; k<newArray.length; k++) {
            if (data[j][0] == "Storage Size") continue;
          if (k != 0) {
            sellRequestData.productName = productName;
            sellRequestData.size = data[j][0];
            sellRequestData.price = newArray[k];
            sellRequestData.condition = productConditionArray[k-1];
            sellRequest.push(sellRequestData);
            sellRequestData = {};
          }
        }
      } else {
        break;
      }
      }
    };
  }

  const dbData = await SellRequest.insertMany(buyRequest);

  return dbData;
}

module.exports = {
  saveDataToDBFromSheetService,
};