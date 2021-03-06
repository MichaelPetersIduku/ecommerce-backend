// eslint-disable-next-line @typescript-eslint/no-var-requires
const joi = require("@hapi/joi");

const runScriptSchema = joi.object({
  scriptToRun: joi.string().required().allow("buyRequest", "sellRequest"),
});

module.exports = {
  runScriptSchema
};
