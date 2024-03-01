const express  = require("express") 
const router = express.Router();

//게시글 쓰기
router.post("/", (req, res) => {
    try{
        if(!req.session.idx){
            throw new Error("로그인을 해주세요.")
        }
        const { title, content } = req.body
        const result = {
            "success" : false
        }

        if(title.length < 1 || title.length > 30){
            throw new Error("제목은 30자 이내로 작성하세요")
        }
        if(content.length < 1 || content.length > 1500){
            throw new Error("내용은 1500자 이내로 작성하세요")
        }
        
        result.success = true
        res.send(result)

    }catch(e){
        result.message = e.message
        res.send(result)
    }
})

//게시글 읽기
router.get('/:postId', (req, res) => {
    try{
        const { postId } = req.params
        let post
        // post = {
        //     "title": "제목",
        //     "content": "내용",
        //     "date": "날짜",
        //     "writer": "작성자"
        // }
        if(!post){
            throw new Error("해당 게시글이 없거나 삭제되었습니다")
        }
        res.send(post)
        
    }catch(e){
        res.send(e.message)
    }
})

//게시글 수정
router.put("/:postId", (req, res) => {
    try{
        const { postId } = req.params
        const { title, content } = req.body
        const result = {
            "success" : false
        }

        if(!req.session.idx){
            throw new Error("로그인을 해주세요.")
        }

        if(title.length < 1 || title.length > 30){
            throw new Error("제목은 30자 이내로 작성하세요")
        }
        if(content.length < 1 || content.length > 1500){
            throw new Error("내용은 1500자 이내로 작성하세요")
        }

        //db 연동

        result.success = true
        res.send(result)  

    }catch(e){
        result.message = e.message
        res.send(result)
    }
})

//게시글 삭제
router.delete("/:postId", (req, res) => {
    try{
        const { postId } = req.params
        const result = {
            "success" : false
        }
        if(!req.session.idx){
            throw new Error("로그인을 해주세요.")
        }

        //db 연동

        result.success = true
        res.send(result)  
    }catch(e){
        result.message = e.message
        res.send(result)
    }
})

//게시글 전체 목록
router.get("/", (req, res) => {
    try{
        let postList = {}
        res.send(postList)
    }catch(e){
        res.send(e.message)
    }
})

module.exports = router;