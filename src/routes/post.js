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
//게시글 쓰기
router.post("/", async (req, res) => {
    const { title, content } = req.body
    const sql = "INSERT INTO post(title, content, account_idx, post_category_idx) VALUES(?, ?, ?, ?)"
    const result = {
        "success" : false,
        "message": ""
    }

    try{
        validator.session(req.session.idx)
        validator.post({title:title, content:content})

        const post = await query(sql, [title, content, req.session.idx, 1])
  
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 읽기
router.get('/:postIdx', async (req, res) => {
    const { postIdx } = req.params
    const sql = "SELECT post_category.name, post.title, post.date, account.nickname , post.content, account.idx FROM post,account,post_category WHERE post.idx = ? AND post.account_idx = account.idx AND post.post_category_idx = post_category.idx"
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        const post = await query(sql, postIdx)
        console.log(post)
        if(post == ""){
            throw new Error("해당 게시글이 없거나 삭제되었습니다")
        }
        result.success = true
        
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 수정
router.put("/:postIdx", async (req, res) => {
    const { postIdx } = req.params
    const sql = "UPDATE post SET title=?, content=?,post_category_idx=? WHERE idx = ?"
    const { title, content } = req.body
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)
        validator.post({title:title, content:content})

        const post = await query(sql, [title, content, 1, postIdx])

        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 삭제
router.delete("/:postIdx", async (req, res) => {
    const { postIdx } = req.params
    const sql = "DELETE FROM post WHERE idx = ?"
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)

        const post = await query(sql, postIdx)
        result.success = true 

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 전체 목록
router.get("/", async (req, res) => {
    const sql = "SELECT post.idx, post.date, post_category.name, post.title, post.idx FROM post, post_category WHERE post.post_category_idx = post_category.idx ORDER BY post.idx DESC"
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        
        const post = await query(sql)
        result.data = post
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

module.exports = router;