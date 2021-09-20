const { logger } = require("firebase-functions");

const controllerResponseHandler = async (response, res) => {
    const { code, status, message, data } = response;
    return res.status(code).json({ status, message, data });
};

const controllerErrorHandler = async (error, res) => {
    return res.status(500).json({status: false, message: "Internal Server Error", data: error});
}

const successResponse = async (message, data) => {
  return {
    status: true,
    message,
    data,
    code: 200,
  };
};

const failureResponse = async (req, message, data) => {
    const { ip, method, originalUrl } = req;
    logger.error(`Bad Request: 400`, `URL:${originalUrl} - METHOD:${method} - IP:${ip}`);
    logger.error("Request Body", req.body);
    logger.error("Error", data);
    return {
      status: true,
      message,
      data,
      code: 200,
    };
  };

const serverErrorResponse = async (req, error) => {
    const { ip, method, originalUrl } = req;
    logger.error(`Server Error: 500`, `URL:${originalUrl} - METHOD:${method} - IP:${ip}`);
    logger.error("Request Body", req.body);
    logger.error("Error", error);
    return {
        status: false,
        message: "Internal Server Error",
        data: error,
        code: 500,
      };
}

module.exports = {
  controllerResponseHandler,
  controllerErrorHandler,
  successResponse,
  failureResponse,
  serverErrorResponse
};
