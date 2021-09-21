const { encode } = require("base-64");
const { config } = require("secreta");

const { API_KEY } = config;

const inputValidator = (schema) => {
  return (req, res, next) => {
    for (const [key, value] of Object.entries(schema)) {
      if (key === "body") {
        // @ts-ignore
        const { error } = value.validate(req.body);
        if (error) {
          return res.status(400).json({
            status: false,
            message: error.message,
            data: "invalid payload",
          });
        }
      } else if (key === "query") {
        // @ts-ignore
        const { error } = value.validate(req.query);
        if (error) {
          return res.status(400).json({
            status: false,
            message: error.message,
            data: "invalid payload",
          });
        }
      } else {
        // @ts-ignore
        const { error } = value.validate(req.params);
        if (error) {
          logger.log(error, "++++++++++++++++++++++++++++++++++++++++++");

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
  let accessToken = req.headers.authorization;
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
    if (auth != token) {
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
