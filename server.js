const express = require("express"); //express파일을 import
const { buffer } = require("stream/consumers");
const pool = require("./database/connect/postgresql");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const fs = require("fs"); //외부 파일을 가져옴
const https = require("https");
const schedule = require("node-schedule");
const redis = require("redis").createClient();
const loggingModule = require("./src/utils/loggingModule.js");
const sslPort = 8443;
const app = express();
const port = 8000;

const options = {
  key: fs.readFileSync(`${__dirname}/ssl/key.pem`),
  cert: fs.readFileSync(`${__dirname}/ssl/cert.pem`),
  passphrase: "1234",
};

require("dotenv").config();

app.use(cookieParser());
mongoose
  .connect("mongodb://localhost:27017/backend")
  .then(() => {
    console.log("mongoose connected");
  })
  .catch((error) => {
    console.log("mongoose connection fail", error);
  });

app.use(express.json());

const session = require("express-session");
const MemoryStore = require("memorystore")(session);

app.use(
  session({
    secret: "haidilao",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 60 * 60 * 1000,
    }),
    name: "Cookie",
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
const accountApi = require("./src/routes/account"); // 외부 js 파일 import
const postApi = require("./src/routes/post");
const commentApi = require("./src/routes/comment");
const notificationApi = require("./src/routes/notification");
const replyCommentApi = require("./src/routes/replyComment.js");
const refreshTokenApi = require("./src/utils/remakeAccessToken.js");
const visitorApi = require("./src/routes/visitor.js");
const loggingApi = require("./src/routes/logging.js");

app.use(loggingModule);

app.use("/account", accountApi);
app.use("/post", postApi);
app.use("/comment", commentApi);
app.use("/notification", notificationApi);
app.use("/reply-comment", replyCommentApi);
app.use("/logging", loggingApi);
app.use("/visitor", visitorApi);
app.use("/refresh-token", refreshTokenApi);

app.use((req, res, next) => {
  const error = new Error("api not found");
  error.status = 404;
  throw error;
});
app.use(async (err, req, res, next) => {
  res.result = {
    success: false,
    message: err.message,
  };
  res.status(err.status || 500).send(res.result);
});

//Web Server 실행 코드

app.listen(port, () => {
  console.log(`${port}번에서 HTTP Web Server 실행`);
  schedule.scheduleJob("0 0 0 * * *", async () => {
    try {
      await redis.connect();
      let todayVisitor = await redis.get("today_visitor");
      await pool.query(
        `INSERT INTO backend.visitor(login_number) VALUES ($1)`,
        [todayVisitor]
      );
      const loginUserList = await redis.ZRANGE(
        "login_userlist",
        0,
        -1,
        "withscores",
        (err, result) => {
          console.log(result);
        }
      );
      await pool.query(
        `INSERT INTO backend.login_users(login_users) VALUES ($1)`,
        [loginUserList.reverse()]
      );
      await redis.del("today_visitor");
    } catch (e) {
      return next(e);
    } finally {
      redis.disconnect();
    }
  });
});

//https 실행 파일

https.createServer(options, app).listen(sslPort, () => {
  console.log(`${sslPort}번에서 HTTPS Web Server 실행`);
});
