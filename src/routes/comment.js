const express  = require("express") 
const router = express.Router();

//댓글 쓰기
router.post("/:postId", (req, res) => {
    try{
        const { postId } = req.params
        const { content } = req.body
        const { writer } = req.session.idx
        const result = {
            "success" : false
        }

        if(content.length < 1 || content.length > 500){
            throw new Error("내용은 500자 이내로 작성하세요")
        }
        if(!writer){
            throw new Error("로그인을 하고 작성하실 수 있습니다.")
        }

        //db 연동

        result.success = true
        res.send(result)
    }catch(e){
        res.send(e.message)
    }
})

//댓글 읽기
router.get("/:postId", (req, res) => {
    try{
        const { postId } = req.params
        let commentList = {}
        commentList = {
            "writer": "댓글 작성자",
            "content": "내용"
        }
        res.send(commentList)

    }catch(e){
        res.send(e.message)
    }
})

//댓글 수정
router.put("/:commentId", (req, res) => {
    try{
        const { commentId } = req.params
        const { writer } = req.session.idx
        const { content } = req.body
        const result = {
            "success" : false
        }

        if(content.length < 1 || content.length > 500){
            throw new Error("내용은 500자 이내로 작성하세요")
        }
        if(!writer){
            throw new Error("로그인을 하고 작성하실 수 있습니다.")
        }

        //db 연동

        result.success = true
        res.send(result)
    }catch(e){
        res.send(e.message)
    }
})

//댓글 삭제
router.delete("/:commentId", (req, res) => {
    try{
        const { commentId } = req.params
        const { writer } = req.session.idx
        const result = {
            "success" : false
        }

        if(!writer){
            throw new Error("로그인을 하고 작성하실 수 있습니다.")
        }

        //db 연동

        result.success = true
        res.send(result)
    }catch(e){
        res.send(e.message)
    }
})

module.exports = router;
