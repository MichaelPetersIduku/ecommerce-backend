const Router = require("express");
const { isAuthenticated, inputValidator } = require("../../util/middleware");
const { saveDataToDBFromSheetController } = require("./googlesheet.controller");
const { runScriptSchema } = require("./googlesheet.validator");
const googlesheetRouter = Router();

googlesheetRouter.post(
  "/runScript",
  isAuthenticated,
  inputValidator({query: runScriptSchema}),
  saveDataToDBFromSheetController
);

module.exports = {
  googlesheetRouter,
};
