const { InternalServerErrorException } = require("./Exception");

const loginUsers = async function (account) {
  const redis = require("redis").createClient();
  await redis.connect();
  try {
    await redis.zAdd("login_userlist", [
      { score: Date.now(), value: String(account.idx) },
    ]);
    let loginUserList = await redis.ZRANGE(
      "login_userlist",
      0,
      -1,
      "withscores"
    );
    let i = 0;
    while (loginUserList.length > 5) {
      await redis.ZREM("login_userlist", loginUserList[i]);
      loginUserList = await redis.ZRANGE("login_userlist", 0, -1, "withscores");
      i++;
    }
  } catch (e) {
    throw new InternalServerErrorException("서버 에러");
  } finally {
    await redis.disconnect();
  }
};
module.exports = loginUsers;
