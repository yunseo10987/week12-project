const redis = require("redis").createClient();

const todayVisitor = async (req, res, next) => {
  try {
    await redis.connect();
    let todayVisitorData = await redis.get("today_visitor");
    if (todayVisitorData) {
      await redis.set("today_visitor", parseInt(todayVisitorData) + 1);
    } else {
      await redis.set("today_visitor", 1);
    }
  } catch (e) {
    throw new Error("서버 에러");
  } finally {
    await redis.disconnect();
  }
};

module.exports = todayVisitor;
