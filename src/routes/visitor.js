const router = require("express").Router();
const redis = require("redis").createClient();
const checkLogin = require("../middlewares/checkLogin");

router.get("/today", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };
  try {
    await redis.connect();
    let data = await redis.get("today_visitor");
    result.data.visitor = data;
    result.success = true;
    res.result = result;
    res.send(result);
  } catch (e) {
    return next(e);
  } finally {
    redis.disconnect();
  }
});

router.get("/total", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };
  try {
    await redis.connect();
    let data = await redis.get("total_visitor");
    result.data.visitor = data;
    result.success = true;
    res.result = result;
    res.send(result);
  } catch (e) {
    return next(e);
  } finally {
    redis.disconnect();
  }
});

router.get("/userList", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };
  try {
    await redis.connect();
    const loginUserList = await redis.ZRANGE(
      "login_userlist",
      0,
      -1,
      "withscores",
      (err, result) => {
        console.log(result);
      }
    );
    result.data.visitor = loginUserList.reverse();
    result.success = true;
    res.result = result;
    res.send(result);
  } catch (e) {
    return next(e);
  } finally {
    redis.disconnect();
  }
});

router.delete("/", checkLogin, async (req, res, next) => {
  const result = {
    success: false,
    data: {},
  };
  try {
    await redis.connect();
    await redis.sendCommand(["SAVE"]);
    await redis.del("today_visitor");
    result.success = true;
    res.send(result);
  } catch (e) {
    return next(e);
  } finally {
    redis.disconnect();
  }
});

module.exports = router;
