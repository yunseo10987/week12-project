const express  = require("express") 
const router = express.Router();

//댓글 쓰기
router.post("/comment/:post-id", (req, res) => {
    try{
        const { postId } = req.params
    }catch(e){
        res.send(e.message)
    }
})

//댓글 읽기
router.get("/comment/:post-id", (req, res) => {
    try{
        const { postId } = req.params

    }catch(e){
        res.send(e.message)
    }
})

//댓글 수정
router.put("/comment?post-id&comment-id", (req, res) => {
    try{
        const { postId, commentId } = req.params
        res.send({postId, commentId})
    }catch(e){
        res.send(e.message)
    }
})

//댓글 삭제
router.delete("/comment?post-id&comment-id", (req, res) => {
    try{
        const { postId, commentId } = req.params

    }catch(e){
        res.send(e.message)
    }
})

module.exports = router;
