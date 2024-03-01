// const express  = require("express") 
// const router = express.Router();
const router = require("express").Router()
const check = require('../utils/validator')
//로그인
router.post("/login", (req, res) => {
    
    const {id, pw} = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data": ""
    }        

    try{
        check.validation({id:id, pw:pw})

        //db 연결
        if(id == "stageus1234" && pw == "qwer1234!"){
            result.success = true
            result.data = {
                "id": id,
                "pw": pw
            }
            let idx = 1
            req.session.idx = idx
            let sessionIdx = req.session.idx
        }
        else{
            result.message = "아이디 혹은 비밀번호가 틀렸습니다."
        }

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//로그아웃
router.delete("/logout", (req, res) => {
    const result = {
        "success" : false,
        "message" : ""
    }
    try{
        if(!req.session.idx){
            result.message = "로그인을 해주세요"
        }
        else{
            req.session.destroy()
            result.success = true
        }
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//회원 가입
router.post("/", (req, res) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender} = req.body
    const result = {
        "success": false,
        "message": ""
    }

    try{
        check.validation({id:id, pw:pw, name:name, birth:birth, phoneNumber:phoneNumber, email:email, nickname:nickname, gender:gender})

        //db 연결
        
        // 결과 전송
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//회원 탈퇴
router.delete("/:idx", (req, res) => {
    const { idx } = req.params
    const result = {
        "success" : false
    }

    try{
        if(!req.session.idx){
            throw new Error("로그인을 해주세요.")
        }
        

        //db 연결

        if(0){
            result.message = "존재하지 않는 회원입니다."
        }else{
            result.success = true
            req.session.destroy();
        }
        
    }catch(e){
        result.message = e.message
        
    }finally{
        res.send(result)
    }
})


//아이디 찾기
router.get("/find-id", (req, res) =>{
    const { phoneNumber, email } = req.query
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }

    try{
        check.validation({phoneNumber: phoneNumber, email:email})
        
        //db 연동

        //id = "stageus1234"
        
        if(result.data == ""){
            throw new Error("일치하는 아이디가 없습니다.")
        }
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//비밀번호 찾기
router.get("/find-pw", (req, res) =>{
    const { id, phoneNumber } = req.query
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }
    try{
        check.validation({id:id, phoneNumber:phoneNumber})
       

        //db 연동

        //pw = "qwer1234!"
        
        if(result.data == ""){
            throw new Error("일치하는 비밀번호가 없습니다")
        }
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//내 정보 보기
router.get("/", (req, res) => {
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }
    try{
        if(!req.session.idx){
            throw new Error("로그인을 해주세요.")
        }

        let userInfo = {}

        userInfo = {
            "id": "아이디",
            "name": "이름",
            "nickname": "닉네임"
        }

        if(0){
            throw new Error("존재하지 않는 회원입니다.")
        }else{
            result.success = true
            result.data = userInfo
        }

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})


//내 정보 수정
router.put("/", (req, res) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender} = req.body
    const result = {
        "success": false,
        "message": ""
    }

    try{
        if(!req.session.idx){
            throw new Error("로그인을 해주세요.")
        }
        
        check.validation({id:id, pw:pw, name:name, birth:birth, phoneNumber:phoneNumber, email:email, nickname:nickname, gender:gender})
        //db 연결

        if(0){

        }else{
            result.success = true
        }
       

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//export 작업
module.exports = router;