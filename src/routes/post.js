const express  = require("express") 
const router = express.Router();

//게시글 쓰기
router.post("/", (req, res) => {
    try{
        const { title, content } = req.body
    res.send({title, content})

    }catch(e){
        res.send(e.message)
    }
})

//게시글 읽기
router.get("/:post-id", (req, res) => {
    try{
        const { postId } = req.params

    }catch(e){
        res.send(e.message)
    }
})

//게시글 수정
router.put("/:postId", (req, res) => {
    try{
        const { postId } = req.params.postId
        const { title, content } = req.body
        res.send(postId)  

    }catch(e){
        res.send(e.message)
    }
})

//게시글 삭제
router.delete("/:post-id", (req, res) => {
    try{
        const { postId } = req.params

    }catch(e){
        res.send(e.message)
    }
})

//게시글 전체 목록
router.get("/", (req, res) => {
    try{

    }catch(e){
        res.send(e.message)
    }
})

module.exports = router;