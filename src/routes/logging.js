const router = require("express").Router();
const checkLogin = require("../middlewares/checkLogin");
const loggingModel = require("../mongooseSchema/loggingSchema");
const { ForbiddenException } = require("../utils/Exception");

router.get("/", checkLogin, async (req, res, next) => {
  try {
    const loginUser = req.decoded;
    if (loginUser.rank !== "admin") {
      throw new ForbiddenException("접근 가능한 계정이 아닙니다.");
    }
    const loggingData = await loggingModel.find();

    res.send({
      success: true,
      data: loggingData,
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
