const router = require("express").Router();
const notification = require("../mongooseSchema/notificationsSchema");
const checkLogin = require("../middlewares/checkLogin");
const jwt = require("jsonwebtoken");
const loggingModel = require("../mongooseSchema/loggingSchema");
const requestIp = require("request-ip");

router.get("/", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = req.loginUser;
    const notifications = await notification
      .find({
        $or: [
          { type: "global", "data.writer": { $ne: loginUser.nickname } },
          { type: "individual", receiver: loginUser.idx, is_read: false },
        ],
      })
      .sort({ createdAt: "desc" });
    await notification.updateMany(
      { type: "individual", receiver: loginUser.idx },
      { is_read: true }
    );

    await loggingModel.create({
      type: "GET/ notification",
      client: loginUser.idx,
      client_ip: requestIp.getClientIp(req),
      request: req.body,
      response: {
        success: true,
        data: notifications,
      },
    });
    result.success = true;
    result.data = notifications;
    res.send(result);
  } catch (e) {
    e.api = "GET/ notification";
    return next(e);
  }
});

module.exports = router;
