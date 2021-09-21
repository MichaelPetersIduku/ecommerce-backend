const { config } = require("secreta");

const {
  SPREADSHEET_DOC_PROD,
  SPREADSHEET_DOC_TEST,
} = config;
const SPREADSHEET_DOC = SPREADSHEET_DOC_PROD

module.exports = {
    SPREADSHEET_DOC,
}