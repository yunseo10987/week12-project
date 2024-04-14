const loggingModel = require("../mongooseSchema/loggingSchema");
const requestIp = require("request-ip");

const loggingModule = (req, res, next) => {
  const originalSend = res.send;
  res.send = (result) => {
    res.result = result;
    res.send = originalSend;
    return res.send(result);
  };

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
