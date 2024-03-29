const router = require("express").Router();
const checkLogin = require("../middlewares/checkLogin");
const jwt = require("jsonwebtoken");
const loggingModel = require("../mongooseSchema/loggingSchema");
const requestIp = require("request-ip");
const checkAdmin = require("../middlewares/checkAdmin");

router.get("/", checkLogin, checkAdmin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };
  try {
    const loginUser = jwt.decode(req.cookies.access_token);
    const loggingData = await loggingModel.find();

    await loggingModel.create({
      type: "GET/ logging",
      client: loginUser.idx,
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: loggingData,
      },
    });
    result.success = true;
    result.data = loggingData;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
