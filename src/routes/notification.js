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
    validator.session(req.session.idx);
    const notifications = await notification.find({
      $or: [
        { type: "global" },
        { type: "individual", receiver: req.session.idx },
      ],
    });
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
