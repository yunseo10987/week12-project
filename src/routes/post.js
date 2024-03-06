const express  = require("express") 
const router = express.Router();
const validator = require('../utils/validator')
const client = require("../../database/connect/postgresql")

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

//게시글 전체 목록
router.get("/all", async (req, res) => {
    const sql = 
        `SELECT post.idx, post.date, post_category.name, post.title, post.idx 
        FROM backend.post P 
        LEFT OUTER JOIN backend.post_category PC ON P.post_category_idx = PC.idx 
        ORDER BY post.idx DESC`
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        
        const post = await client.query(sql)
        result.data = post.rows
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 쓰기
router.post("/", async (req, res) => {
    const { title, content, category } = req.body
    const sql = "INSERT INTO backend.post(title, content, account_idx, post_category_idx) VALUES($1, $2, $3, $4)"
    const result = {
        "success" : false,
        "message": ""
    }

    try{
        validator.session(req.session.idx)
        validator.post({title:title, content:content})

        await client.query(sql, [title, content, req.session.idx, category])
  
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
    const sql = `
        SELECT P.title, P.crerated_at,P.content, A.idx, A.nickname, PC.name
        FROM backend.post P 
        LEFT OUTER JOIN backend.account A ON P.account_idx = A.idx
        LEFT OUTER JOIN backend.post_category PC ON P.post_category_idx = PC.idx
        WHERE P.idx = $1
        `
    
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        const post = await client.query(sql, [postIdx])
        console.log(post)
        if(!post.rows.length){
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
    const sql = "UPDATE backend.post SET title=$1, content=$2,post_category_idx=$3 WHERE idx = $4"
    const { title, content, category } = req.body
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)
        validator.post({title:title, content:content})

        await client.query(sql, [title, content, category, postIdx])

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
    const sql = "DELETE FROM backend.post WHERE idx = $1"
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)

        await client.query(sql, [postIdx])
        result.success = true 

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})



module.exports = router;