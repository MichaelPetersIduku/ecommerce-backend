/* eslint-disable @typescript-eslint/no-var-requires */
const { config } = require("secreta");

const {
  SPREADSHEET_DOC_PROD,
} = config;
const SPREADSHEET_DOC = SPREADSHEET_DOC_PROD

module.exports = {
    SPREADSHEET_DOC,
}