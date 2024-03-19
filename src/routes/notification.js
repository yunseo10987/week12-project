const router = require("express").Router();
const validator = require("../utils/validator");
const notification = require("../mongooseSchema/notificationsSchema");

router.get("/", async (req, res) => {
  const result = {
    success: false,
    message: "",
    data: "",
  };

  try {
    const loginUser = req.session;
    validator.session(loginUser.idx);
    const notifications = await notification.find({
      $or: [
        { type: "global" },
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
