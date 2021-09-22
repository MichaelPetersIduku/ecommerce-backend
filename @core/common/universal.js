/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
const fetch = require("node-fetch");

const apiCall = async (api, body, headers, method) => {
  try {
    const payLoad = { headers, method };
    // eslint-disable-next-line no-unused-expressions
    body ? (payLoad.body = JSON.stringify(body)) : payLoad;
    console.log("PAYLOAD", payLoad);
    const result = await fetch(api, payLoad);
    console.log("RESULT", result);
    return result;
  } catch (error) {
    console.error(error);
    return { request: { api, body, headers, method }, error };
  }
};

const reverseFormatAmount = (amountString) => {
  let amount = amountString;
  if (!amount.includes(".")) amount += ".00";
  const a = 
    `${amount
      .toString()
      .split(".")[0]
      .replace(/[^0-9]+/g, "")}.${amount.toString().split(".")[1]}`;
      return Number(a);
};

module.exports = {
  apiCall,
  reverseFormatAmount,
};
