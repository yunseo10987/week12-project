const redis = require("redis").createClient();

const loginUsers = async function () {
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
};
module.exports = loginUsers;
