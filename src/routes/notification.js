const router = require("express").Router();
const notification = require("../mongooseSchema/notificationsSchema");
const checkLogin = require("../middlewares/checkLogin");

router.get("/", checkLogin, async (req, res) => {
  const result = {
    success: false,
    message: "",
    data: "",
  };

  try {
    const loginUser = jwt.decode(req.cookies.access_token);
    const notifications = await notification.find({
      $or: [
        { type: "global", writer: { $ne: loginUser.nickname } },
        { type: "individual", receiver: loginUser.idx, is_read: false },
      ],
    });
    await notification.updateMany(
      { type: "individual", receiver: loginUser.idx },
      { is_read: true }
    );
    result.success = true;
    result.data = notifications;
  } catch (e) {
    console.log(e.message);
    result.message = e.message;
  } finally {
    res.send(result);
  }
});

module.exports = router;
