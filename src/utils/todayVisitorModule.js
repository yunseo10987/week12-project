const redis = require("redis").createClient();

const todayVisitor = async function () {
  await redis.connect();
  let todayVisitorData = await redis.get("today_visitor");
  if (todayVisitorData) {
    await redis.set("today_visitor", parseInt(todayVisitorData) + 1);
  } else {
    await redis.set("today_visitor", 1);
  }
};
module.exports = todayVisitor;
