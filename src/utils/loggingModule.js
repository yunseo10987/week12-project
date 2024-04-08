const loggingModel = require("./src/mongooseSchema/loggingSchema.js");
const requestIp = require("request-ip");

const loggingModule = (req, res, next) => {
  res.on("finish", async () => {
    try {
      await loggingModel.create({
        method: req.method,
        entryPoint: req.originalUrl,
        client: req.loginUser,
        client_ip: requestIp.getClientIp(req),
        request: req.body,
        response: res.result,
      });
    } catch (e) {
      console.log(e.message);
    }
  });
  next();
};

module.exports = loggingModule;
