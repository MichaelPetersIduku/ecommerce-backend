/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
const { encode } =  require("base-64");
const { config } = require("secreta");

const { API_KEY } = config;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const inputValidator = (schema) => {
  return (req, res, next) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(schema)) {
      if (key === "body") {
        const { error } = value.validate(req.body);
        if (error) {
          return res.status(400).json({
            status: false,
            message: error.message,
            data: "invalid payload",
          });
        }
      } else if (key === "query") {
        const { error } = value.validate(req.query);
        if (error) {
          return res.status(400).json({
            status: false,
            message: error.message,
            data: "invalid payload",
          });
        }
      } else {
        const { error } = value.validate(req.params);
        if (error) {
          console.log(error, "++++++++++++++++++++++++++++++++++++++++++");

          return res.status(400).json({
            status: false,
            message: error.message,
            data: "invalid payload",
          });
        }
      }
    }
    next();
  };
};

const isAuthenticated = (req, res, next) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return res.status(401).json({
      status: false,
      message: "please provide Basic auth token",
      data: null,
    });
  }
  try {
    const auth = accessToken.split(" ")[1];
    const token = encode(API_KEY);
    if (auth !== token) {
      return res.status(401).json({
        status: false,
        message: "invalid token",
        data: "invalid token",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message:
        "please check your token and re-try again. If this persist, please contact support",
      data: "invalid token",
    });
  }
};

module.exports = {
  isAuthenticated,
  inputValidator,
};
