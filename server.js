const express = require("express"); //express파일을 import
const { buffer } = require("stream/consumers");
const pool = require("./database/connect/postgresql");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const requestIp = require("request-ip");
const loggingModel = require("./src/mongooseSchema/loggingSchema.js");
const fs = require("fs"); //외부 파일을 가져옴
const https = require("https");

const sslPort = 8443;
const app = express();
const port = 8000;

const options = {
  key: fs.readFileSync(`${__dirname}/ssl/key.pem`),
  cert: fs.readFileSync(`${__dirname}/ssl/cert.pem`),
  passphrase: "1234",
  //"ca":        //ssl을 돈 주고 구입하면 ca 파일을 줌(인증된 회사 파일)
};
//const cors = require("cors")
require("dotenv").config();
//mariadb.connect()
// const mongoPool = async function(){
//     await mongoDb.connect('mongodb://localhost:27017/backend')
// }

// try{
//     mongoPool()
// }catch(e){
//     console.log(e.message)
//}
app.use(cookieParser());
mongoose
  .connect("mongodb://localhost:27017/backend")
  .then(() => {
    console.log("mongoose connected");
  })
  .catch((error) => {
    console.log("mongoose connection fail", error);
  });

//client.connect()
//우리가 통신에서 json으로 값을 주고 받긴함
//json은 원래 통신에 사용할 수 없는 자료 구조임
//json을 string으로 변환해서 보내고, 받는 쪽은 json으로 변환해서 사용함
//미들웨어/ 이게 없으면 프론트엔드가 준 값을 json으로 못 바꿈
app.use(express.json());
//app.use(cors())

const session = require("express-session");
const MemoryStore = require("memorystore")(session);
//const cookieParser = require('cookie-parser')

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
const loggingApi = require("./src/routes/logging.js");
const clickerApi = require("./src/routes/clicker.js");
const cartApi = require("./src/routes/cart");

// const chatApi = require("./src/routes/chat");

// const testApi = require("./강의용.js");

//Redirect 설정(http로 접속을 했다면, https 웹 서버로 흐름을 바꿔주는 기능)
// app.get("*",(req, res, next) =>{
//     const protocol = req.protocol
//     console.log(protocol)
//     if(protocol === "http"){
//         const dest = `https://${req.hostname}:${sslPort}${req.url}`
//         console.log(dest)
//         res.redirect(dest)
//     }
//     next()
// })

app.use((req, res, next) => {
  res.on("finish", async () => {
    try {
      await loggingModel.create({
        method: req.method,
        path: req.originalUrl,
        client: req.loginUser,
        client_ip: requestIp.getClientIp(req),
        request: req.body,
        response: res.result,
      });
    } catch (e) {
      console.log(e.message);
    }
  });
  next();
});

// app.use("/", )
app.use("/account", accountApi);
app.use("/post", postApi);
app.use("/comment", commentApi);
app.use("/notification", notificationApi);
app.use("/reply-comment", replyCommentApi);
app.use("/logging", loggingApi);
// app.use("/chat", chatApi);
// app.use("/test", testApi);
app.use("/refresh-token", refreshTokenApi);
app.use("/clicker", clickerApi);
app.use("/cart", cartApi);

app.use((req, res, next) => {
  const error = new Error("api not found");
  error.status = 404;
  throw error;
});

//Web Server 실행 코드

app.use(async (err, req, res, next) => {
  // if (!err.status) {
  //   // 진짜 에러
  // } --> 다음에 물어볼 거
  // 예외
  res.result = {
    success: false,
    message: err.message,
  };
  res.status(err.status || 500).send(res.result);
});

//혹시 모를 옛날 방식인 http 방식으로 들어오는 방식 때문에 8000포트 서버를 열어둠
app.listen(port, () => {
  console.log(`${port}번에서 HTTP Web Server 실행`);
});

//https 실행 파일

https.createServer(options, app).listen(sslPort, () => {
  console.log(`${sslPort}번에서 HTTPS Web Server 실행`);
});
