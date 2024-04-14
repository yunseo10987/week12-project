const router = require("express").Router();
const notification = require("../mongooseSchema/notificationsSchema");
const checkLogin = require("../middlewares/checkLogin");

router.get("/", checkLogin, async (req, res, next) => {
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

    res.send({
      success: true,
      data: notifications,
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
