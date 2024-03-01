// const express  = require("express") 
// const router = express.Router();
const router = require("express").Router()
const validator = require('../utils/validator')
const mariadb = require("../../database/connect/mariadb")

const query = function (sql, params=[]){
    return new Promise((resolve, reject) => {
        mariadb.query(sql, params, (err, rows) => {
            if(err){
                reject(err)
            }else{
                resolve(rows)
            }
    
            
        })
    })
}

//로그인
router.post("/login", async (req, res) => {
    
    const {id, pw} = req.body
    const sql = "SELECT idx, nickname FROM account WHERE id = ? AND password = ?"
    const result = {
        "success" : false,
        "message" : "",
        "data": ""
    }        

    try{
        validator.account({id:id, pw:pw})

        const account = await query(sql, [id, pw])
        if(account == ""){
            throw new Error("아이디/비밀번호가 일치하지 않습니다.")
        }
        result.success = true
        result.data = account
        req.session.idx = account[0].idx

    }catch(e){
        console.log(e)
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
        validator.session(req.session.idx)
        
        req.session.destroy()
        result.success = true
        
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//회원 가입
router.post("/", async (req, res) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender} = req.body
    const sql = "INSERT INTO account(id, password, name, birth_year, phone_number, email, nickname, gender) VALUES(?, ?, ?, ?, ?, ?, ?, ?)"
    const result = {
        "success": false,
        "message": ""
    }

    try{
        validator.account({id:id, pw:pw, name:name, birth:birth, phoneNumber:phoneNumber, email:email, nickname:nickname, gender:gender})

        //db 연결
        const account = await query(sql, [id, pw, name, birth, phoneNumber, email, nickname, gender] )

        // 결과 전송
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//회원 탈퇴
router.delete("/:idx", async (req, res) => {
    const { idx } = req.params
    const sql = "DELETE FROM account WHERE idx = ?"
    const result = {
        "success" : false
    }

    try{
        //validator.session(req.session.idx)
        if(req.session.idx != idx){
            throw new Error("제대로 된 idx 값 전달")
        }
        const account = await query(sql, idx)
        
        result.success = true
        req.session.destroy();

    }catch(e){
        result.message = e.message
        
    }finally{
        res.send(result)
    }
})


//아이디 찾기
router.get("/find-id", async (req, res) =>{
    const { phoneNumber, email } = req.query
    const sql = "SELECT id FROM account WHERE email =? AND phone_number =?"
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }

    try{
        validator.account({phoneNumber: phoneNumber, email:email})
        
        //db 연동
        const account = await query(sql, [email, phoneNumber])
        if(account == ""){
            throw new Error("일치하는 아이디가 없습니다.")
        }

        result.success = true
        result.data = account

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//비밀번호 찾기
router.get("/find-pw", async (req, res) =>{
    const { id, phoneNumber } = req.query
    const sql = "SELECT password FROM account WHERE id =? AND phone_number =?"
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }
    try{
        validator.account({id:id, phoneNumber:phoneNumber})
       
        const account = await query(sql, [id, phoneNumber])
        if(account == ""){
            throw new Error("일치하는 비밀번호가 없습니다")
        }
        
        result.success = true
        result.data = account

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//내 정보 보기
router.get("/", async (req, res) => {
    const sql = "SELECT id, password, name, birth_year, phone_number, email, nickname, gender FROM account WHERE account.idx = ?"
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }
    try{
        validator.session(req.session.idx)

        const account = await query(sql, req.session.idx)
        
        if(account == ""){
            throw new Error("일치하는 정보가 없습니다.")
        }
        result.success = true
        result.data = account
        
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})


//내 정보 수정
router.put("/", async (req, res) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender} = req.body
    const sql = "UPDATE account SET id =?, password=?, name=?, birth_year=?, phone_number=?, email=?, nickname=?, gender=? WHERE idx =?"
    const result = {
        "success": false,
        "message": ""
    }

    try{
        validator.session(req.session.idx)
        
        validator.account({id:id, pw:pw, name:name, birth:birth, phoneNumber:phoneNumber, email:email, nickname:nickname, gender:gender})
        //db 연결
        const account = await query(sql, [id, pw, name, birth, phoneNumber, email, nickname, gender, req.session.idx])

        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//export 작업
module.exports = router;