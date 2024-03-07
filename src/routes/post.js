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
        if(client){
            client.end() 
        }
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
        if(client){
            client.end()
        }
        res.send(result)
    }
})

//게시글 읽기
router.get('/:postIdx', async (req, res) => {
    const { postIdx } = req.params
    const sql = `
        SELECT P.title, P.crerated_at,P.content,P.post_likes A.idx, A.nickname, PC.name
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
        if(client){
            client.end() 
        }
        res.send(result)
    }
})

//게시글 수정
router.put("/:postIdx", async (req, res) => {
    const { postIdx } = req.params
    const sql = "UPDATE backend.post SET title=$1, content=$2,post_category_idx=$3 WHERE idx = $4 AND account_idx = $5"
    const { title, content, category } = req.body
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)
        validator.post({title:title, content:content})

        await client.query(sql, [title, content, category, postIdx, req.session.idx])

        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        if(client){
            client.end() 
        }
        res.send(result)
    }
})

//게시글 삭제
router.delete("/:postIdx", async (req, res) => {
    const { postIdx } = req.params
    const sql = "DELETE FROM backend.post WHERE idx = $1 AND account_idx = $2"
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)

        await client.query(sql, [postIdx, req.session.idx])
        result.success = true 

    }catch(e){
        result.message = e.message
    }finally{
        if(client){
            client.end() 
        }
        res.send(result)
    }
})

//게시물 좋아요
router.put("/postIdx/likes", async (req, res) => {
    const { postIdx } = req.params
    const result = {
        "success" : false,
        "message": ""
    }

    try{
        validator.session(req.session.idx)

        await client.query('BEGIN')
        const isLikers = await client.query('SELECT idx FROM backend.post_likes WHERE post_idx = $1 AND account_idx = $2', [postIdx,req.session.idx])
        if(isLikers.rows){
            await client.query('DELETE FROM backend.post_likes WHERE post_idx = $1 AND account_idx = $2', [postIdx, req.session.idx])
            await client.query('UPDATE backend.post SET post_likes = post_likes - 1 WHERE idx = $1 AND account_idx = $2')

            result.message = "좋아요 취소"
        }else{
            await client.query('INSERT INTO backend.post_likes(post_idx, account_idx) VALUES($1, $2)', [postIdx, req.session.idx])
            await client.query('UPDATE backend.post SET post_likes = post_likes + 1 WHERE idx = $1 AND account_idx = $2')
            
            result.message = "좋아요 추가"
        }
        await client.query('COMMIT')
        result.success = true
    }catch(e){
        await client.query('ROLLBACK')
        result.message = e.message
    }finally{
        if(client){
            client.end() 
        }
        res.send(result)
    }
} )



module.exports = router;