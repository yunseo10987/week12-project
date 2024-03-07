// const express  = require("express") 
// const router = express.Router();
const router = require("express").Router()
const validator = require('../utils/validator')
const pool = require("../../database/connect/postgresql")

// const query = function (sql, params=[]){
//     return new Promise((resolve, reject) => {
//         mariadb.query(sql, params, (err, rows) => {
//             if(err){
//                 reject(err)
//             }else{
//                 resolve(rows)
//             }
//         })
//     })
// }

//로그인
router.post("/login", async (req, res) => {
    
    const {id, pw} = req.body
    const sql = "SELECT idx, nickname FROM backend.account WHERE id = $1 AND password = $2"
    const result = {
        "success" : false,
        "message" : "",
        "data": ""
    }        

    try{
        validator.account({id:id, pw:pw})

        const account = await pool.query(sql, [id, pw])
        if(!account.rows.length){
            throw new Error("아이디/비밀번호가 일치하지 않습니다.")
        }
        result.success = true
        result.data = account.rows
        req.session.idx = account.rows[0].idx

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
    const sql = "INSERT INTO backend.account(id, password, name, birth, phonenumber, email, nickname, gender) VALUES($1, $2, $3, $4, $5, $6, $7, $8)"
    const result = {
        "success": false,
        "message": ""
    }

    try{
        validator.account({id:id, pw:pw, name:name, birth:birth, phoneNumber:phoneNumber, email:email, nickname:nickname, gender:gender})
        await validator.duplicatedId(id)

        //db 연결
        await pool.query(sql, [id, pw, name, birth, phoneNumber, email, nickname, gender])

        // 결과 전송
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//회원 탈퇴
router.delete("/", async (req, res) => {
    
    const sql = "DELETE FROM backend.account WHERE idx = $1"
    const result = {
        "success" : false
    }

    try{
        validator.session(req.session.idx)
        
        await pool.query(sql, [req.session.idx])
        
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
    const sql = "SELECT id FROM backend.account WHERE email =$1 AND phonenumber =$2"
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }

    try{
        validator.account({phoneNumber: phoneNumber, email:email})
        
        //db 연동
        const account = await pool.query(sql, [email, phoneNumber])
        if(!account.rows.length){
            throw new Error("일치하는 아이디가 없습니다.")
        }

        result.success = true
        result.data = account.rows

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//비밀번호 찾기
router.get("/find-pw", async (req, res) =>{
    const { id, phoneNumber } = req.query
    const sql = "SELECT password FROM backend.account WHERE id =$1 AND phonenumber =$2"
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }
    try{
        validator.account({id:id, phoneNumber:phoneNumber})
       
        const account = await pool.query(sql, [id, phoneNumber])
        if(!account.rows.length){
            throw new Error("일치하는 비밀번호가 없습니다")
        }
        
        result.success = true
        result.data = account.rows

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//내 정보 보기
router.get("/", async (req, res) => {
    const sql = "SELECT id, password, name, birth, phonenumber, email, nickname, gender FROM backend.account WHERE idx = $1"
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }
    try{
        console.log(req.session.idx)
        validator.session(req.session.idx)
        const account = await pool.query(sql, [req.session.idx])
        
        if(!account.rows.length){
            throw new Error("일치하는 정보가 없습니다.")
        }
        result.success = true
        result.data = account.rows
        
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})


//내 정보 수정
router.put("/", async (req, res) => {
    const { id, pw, name, birth, phoneNumber, email, nickname, gender} = req.body
    const sql = "UPDATE backend.account SET id =$1, password=$2, name=$3, birth=$4, phonenumber=$5, email=$6, nickname=$7, gender=$8 WHERE idx =$9"
    const result = {
        "success": false,
        "message": ""
    }

    try{
        validator.session(req.session.idx)
        
        validator.account({id:id, pw:pw, name:name, birth:birth, phoneNumber:phoneNumber, email:email, nickname:nickname, gender:gender})
        await validator.duplicatedId(id)
        //db 연결
        await pool.query(sql, [id, pw, name, birth, phoneNumber, email, nickname, gender, req.session.idx])

        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//export 작업
module.exports = router;