const express  = require("express") //express파일을 import
const { buffer } = require("stream/consumers")

const app = express()
const port = 8000

//우리가 통신에서 json으로 값을 주고 받긴함
//json은 원래 통신에 사용할 수 없는 자료 구조임
//json을 string으로 변환해서 보내고, 받는 쪽은 json으로 변환해서 사용함
//미들웨어/ 이게 없으면 프론트엔드가 준 값을 json으로 못 바꿈
app.use(express.json())

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
        saveUninitialized: true,
        store: new MemoryStore({
            checkPeriod: 60 * 60 * 1000
        }),
        cookie:{
            maxAge: 60 * 60 * 1000
        },
    })
)
const accountRoutes = require('./src/routes/account')
const postRoutes = require('./src/routes/post')
const commentRoutes = require('./src/routes/comment')


app.use("/account", accountRoutes)
app.use("/post", postRoutes)
app.use("/comment", commentRoutes)


app.get("/", (req, res) => {
    res.send(`Hello World!`)
})

//로그인
app.post("/login", (req, res) => {
    try{
        const {id, pw} = req.body
        const result = {
            "success" : false
        }
        const regId =  /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/
        const regPw = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
        
        if(!regId.test(id)){
            throw new Error("아이디를 다시 확인해주세요")
        }
        if(!regPw.test(pw)){
            throw new Error("비밀번호를 다시 확인해주세요")
        }

        //db 연결
        if(id == "stageus1234" && pw == "qwer1234!"){
            result.success = true
            let idx = 1
            req.session.idx = idx
            let sessionIdx = req.session.idx
            res.send({result , id, pw , sessionIdx })
            res.redirect("/")
        }
        else{
            res.send('<script>alert("아이디 혹은 비밀번호가 틀렸습니다")</script>')
        }

    }catch(e){
        res.send(`로그인 실패 ${e.message} 에러 발생`)
    }
})

app.delete("/logout", (req, res) => {
    try{
        if(req.session.idx){
            req.session.destroy();
            res.redirect("/")
        }
    }catch(e){
        res.send(`로그아웃 에러 발생`)
    }
})


//Web Server 실행 코드
app.listen(port, () =>{
    console.log(`${port}번에서 HTTP Web Server 실행`)
})