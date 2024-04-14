const router = require("express").Router();
const checkLogin = require("../middlewares/checkLogin");
const loggingModel = require("../mongooseSchema/loggingSchema");

router.get("/", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };
  try {
    const loginUser = req.decoded;
    console.log(loginUser.rank);
    if (loginUser.rank !== "admin") {
      const error = new Error();
      error.message = "접근 가능한 계정이 아닙니다.";
      error.status = 403;
      throw error;
    }
    const loggingData = await loggingModel.find();

    result.success = true;
    result.data = loggingData;
    res.result = result;
    res.send(result);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
