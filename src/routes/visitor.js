const router = require("express").Router();
const checkLogin = require("../middlewares/checkLogin");
const pool = require("../../database/connect/postgresql");

//오늘 방문자 수
router.get("/today", checkLogin, async (req, res, next) => {
  const redis = require("redis").createClient();
  await redis.connect();
  try {
    const todayVisitor = await redis.get("today_visitor");

    res.send({
      success: true,
      data: todayVisitor,
    });
  } catch (e) {
    return next(e);
  } finally {
    if (redis) await redis.disconnect();
  }
});

//총 방문자 수
router.get("/total", checkLogin, async (req, res, next) => {
  const redis = require("redis").createClient();
  await redis.connect();
  try {
    const selectVisitorQueryResult = await pool.query(
      `SELECT login_number FROM backend.visitor`
    );
    let totalVisitor = 0;

    if (selectVisitorQueryResult.rows.length != 0) {
      let loginUsersNumber = 0;
      for (let i = 0; i < selectVisitorQueryResult.rows.length; i++) {
        loginUsersNumber += selectVisitorQueryResult.rows[i].login_number;
      }
      totalVisitor = loginUsersNumber;
    } else {
      let todayVisitor = await redis.get("today_visitor");
      totalVisitor = todayVisitor;
    }

    res.send({
      success: true,
      data: totalVisitor,
    });
  } catch (e) {
    return next(e);
  } finally {
    await redis.disconnect();
  }
});

//최근 로그인한 5명
router.get("/userList", checkLogin, async (req, res, next) => {
  const redis = require("redis").createClient();
  await redis.connect();
  try {
    redis = require("redis").createClient();
    await redis.connect();
    const loginUserList = await redis.ZRANGE(
      "login_userlist",
      0,
      -1,
      "withscores"
    );

    res.send({
      success: true,
      data: loginUserList.reverse(),
    });
  } catch (e) {
    return next(e);
  } finally {
    await redis.disconnect();
  }
});

module.exports = router;
