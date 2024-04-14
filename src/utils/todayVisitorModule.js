const { InternalServerErrorException } = require("./Exception");

const todayVisitor = async (req, res, next) => {
  const redis = require("redis").createClient();
  await redis.connect();
  try {
    let todayVisitorData = await redis.get("today_visitor");
    if (todayVisitorData) {
      await redis.set("today_visitor", parseInt(todayVisitorData) + 1);
    } else {
      await redis.set("today_visitor", 1);
    }
  } catch (e) {
    throw new InternalServerErrorException("서버 에러");
  } finally {
    await redis.disconnect();
  }
};

module.exports = todayVisitor;
