const express  = require("express") //express파일을 import
const { buffer } = require("stream/consumers")
const cors = require("cors")

const app = express()
const port = 8000
const mariadb = require("./database/connect/mariadb")
mariadb.connect()

//우리가 통신에서 json으로 값을 주고 받긴함
//json은 원래 통신에 사용할 수 없는 자료 구조임
//json을 string으로 변환해서 보내고, 받는 쪽은 json으로 변환해서 사용함
//미들웨어/ 이게 없으면 프론트엔드가 준 값을 json으로 못 바꿈
app.use(express.json())
app.use(cors())
// // API (파일을 반환하는 API)
// app.get("/mainpage", (req, res) => {
//     //req는 요청 값 , res는 응답 값
//     //절대 경로로 작성
//     res.sendFile(`${__dirname}/main.html`)
// })


// //API (값을 반환하는 API)
// app.post("/login", (req, res) => {

//     // 통신에서는 Object로 전달
//     const {id, pw} = req.body
//     const result = {
//         "success": false
//     }

//     //데이터베이스 통신
    // if(id === "stageus" && pw === "1234"){
    //     result.success = true
    // }

//     //값 반환
//     res.send(result)
// })

const session = require("express-session")
const MemoryStore = require("memorystore")(session)

app.use(
    session({
        secret: "haidilao",
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 60 * 60 * 1000
        }),
    })
)
const accountApi = require('./src/routes/account') // 외부 js 파일 import
const postApi = require('./src/routes/post')
const commentApi = require('./src/routes/comment')
const validator = require('./src/utils/validator')


// app.use("/", )
app.use("/account", accountApi)
app.use("/post", postApi)
app.use("/comment", commentApi)


app.get("/", (req, res) => {
    res.send(`Hello World!`)
})




//Web Server 실행 코드
app.listen(port, () =>{
    console.log(`${port}번에서 HTTP Web Server 실행`)
})