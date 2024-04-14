const redis = require("redis").createClient();

const loginUsers = async function (account) {
  try {
    await redis.connect();
    await redis.zAdd("login_userlist", [
      { score: Date.now(), value: String(account.idx) },
    ]);
    let loginUserList = await redis.ZRANGE(
      "login_userlist",
      0,
      -1,
      "withscores",
      (err, result) => {
        console.log(result);
      }
    );
    let iter = 0;
    while (loginUserList.length > 5) {
      await redis.ZREM("login_userlist", loginUserList[iter]);
      loginUserList = await redis.ZRANGE(
        "login_userlist",
        0,
        -1,
        "withscores",
        (err, result) => {
          console.log(result);
        }
      );
      iter++;
    }
  } catch (e) {
    throw new Error("서버 에러");
  } finally {
    await redis.disconnect();
  }
};
module.exports = loginUsers;
