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
        if(id === "stageus1234" && pw === "qwer1234!"){
            result.success = true
        }
        
        res.send({result , id})

    }catch(e){
        res.send(e.message)
    }
})

//회원 가입
app.post("/account", (req, res) => {
    try{
        const { id, pw, name, birth, phoneNumber, email, nickname, gender} = req.body
        const result = {
            "success" : false
        }
        const regId =  /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/
        const regPw = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
        const regNum = /^\d{3}-\d{3,4}-\d{4}$/
        const regEmail = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/
        const regBirth = /^\d{4}-\d{2}-\d{2}$/


        if(!regId.test(id)){
            throw new Error("아이디를 다시 확인해주세요")
        }
        if(!regPw.test(pw)){
            throw new Error("비밀번호를 다시 확인해주세요")
        }
        if(name.legnth > 12 || name.legnth < 1){
            throw new Error("이름을 다시 확인해주세요")
        }
        if(!regBirth.test(birth)){
            throw new Error("생년월일을 다시 확인해주세요")
        }
        if(!regNum.test(phoneNumber)){
            throw new Error("전화번호를 다시 확인해주세요")
        }
        if(!regEmail.test(email)){
            throw new Error("이메일을 다시 확인해주세요")
        }
        if(nickname.legnth > 12 || nickname.legnth < 1){
            throw new Error("닉네임을 다시 확인해주세요")
        }
        if(gender != "Male" && gender != "Female"){
            throw new Error("성별을 다시 확인해주세요")
        }
        

        //db 연결
        
        res.send({result})

    }catch(e){
        res.send(e.message)
    }
})

//회원 탈퇴
app.delete("/account/:account-id", (req, res) => {
    try{
        const { id } = req.params
        const result = {
            "success" : false
        }
        const regId =  /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/

        if(!regId.test(id)){
            throw new Error("아이디를 다시 확인해주세요")
        }

    }catch(e){
        res.send(e.message)
    } 
})

//아이디 찾기

//비밀번호 찾기

//내 정보 보기

//내 정보 수정
app.put("/account/:account-id", (req, res) => {
    try{

    }catch(e){
        res.send(e.message)
    }
})

//게시글 쓰기
app.post("post", (req, res) => {
    try{
        const { title, content } = req.body

    }catch(e){
        res.send(e.message)
    }
})

//게시글 읽기
app.get("post/:post-id", (req, res) => {
    try{
        const { postId } = req.params

    }catch(e){
        res.send(e.message)
    }
})

//게시글 수정
app.post("post/:post-id", (req, res) => {
    try{
        const { postId } = req.params
        const { title, content } = req.body

    }catch(e){
        res.send(e.message)
    }
})

//게시글 삭제
app.delete("post/:post-id", (req, res) => {
    try{
        const { postId } = req.params

    }catch(e){
        res.send(e.message)
    }
})

//게시글 전체 목록
app.get("post", (req, res) => {
    try{

    }catch(e){
        res.send(e.message)
    }
})

//댓글 쓰기
app.post("post/:post-id/comment", (req, res) => {
    try{
        const { postId } = req.params
    }catch(e){
        res.send(e.message)
    }
})

//댓글 읽기
app.get("post/:post-id/comment", (req, res) => {
    try{
        const { postId } = req.params

    }catch(e){
        res.send(e.message)
    }
})

//댓글 수정
app.put("post/:post-id/comment/:comment-id", (req, res) => {
    try{
        const { postId, commentId } = req.params
    }catch(e){
        res.send(e.message)
    }
})

//댓글 삭제
app.delete("post/:post-id/comment/:comment-id", (req, res) => {
    try{
        const { postId, commentId } = req.params

    }catch(e){
        res.send(e.message)
    }
})

