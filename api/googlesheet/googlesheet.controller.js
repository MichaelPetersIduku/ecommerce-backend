const { controllerResponseHandler, controllerErrorHandler } = require("../../@core/common/response");
const { saveDataToDBFromSheetService } = require("./googlesheet.service");

const saveDataToDBFromSheetController = async (req, res) => {
  try {
    const response = await saveDataToDBFromSheetService(req);
    controllerResponseHandler(response, res);
  } catch (error) {
    controllerErrorHandler(error, res);
  }
};

module.exports = {
  saveDataToDBFromSheetController
};
