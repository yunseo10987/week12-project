const express  = require("express") 
const router = express.Router();
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

//댓글 쓰기
router.post("/:postIdx", async (req, res) => {
    const sql = "INSERT INTO comment(content, post_idx, account_idx) VALUES(?, ?, ?)"
    const { postIdx } = req.params
    const { content } = req.body
    const result = {
        "success": false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)
        validator.comment(content)

        const comment = await query(sql, [content, postIdx, req.session.idx])
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//댓글 읽기
router.get("/:postIdx", async (req, res) => {
    const sql = "SELECT comment.content, comment.date, account.nickname, comment.account_idx, comment.idx FROM comment,account WHERE comment.post_idx = ? AND comment.account_idx = account.idx ORDER BY comment.idx"
    const { postIdx } = req.params
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }
    try{
        const comment = await query(sql, postIdx)

        result.success = true
        result.data = comment

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//댓글 수정
router.put("/:commentIdx", async (req, res) => {
    const sql = "UPDATE comment SET content=? WHERE idx = ?"
    const { commentIdx } = req.params
    const { content } = req.body
    const result = {
        "success": false,
        "message": ""
    }
    try{
        
        validator.session(req.session.idx)
        validator.comment(content)

        const comment = await query(sql, [content, commentIdx])
        result.success = true
       
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//댓글 삭제
router.delete("/:commentIdx", async (req, res) => {
    const sql = "DELETE FROM comment WHERE idx = ?"
    const { commentIdx } = req.params
    const result = {
        "success": false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)
        
        const comment = await query(sql, commentIdx)
        result.success = true
        
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

module.exports = router;
