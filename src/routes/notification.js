const router = require("express").Router();
const notification = require("../mongooseSchema/notificationsSchema");
const checkLogin = require("../middlewares/checkLogin");

router.get("/", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };

  try {
    const loginUser = req.decoded;
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

    result.success = true;
    result.data = notifications;
    res.result = result;
    res.send(result);
  } catch (e) {
    e.api = "GET/ notification";
    return next(e);
  }
});

module.exports = router;
