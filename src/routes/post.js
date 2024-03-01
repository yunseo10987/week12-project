const express  = require("express") 
const router = express.Router();
const validator = require('../utils/validator')

//게시글 쓰기
router.post("/", (req, res) => {
    const { title, content } = req.body
    const result = {
        "success" : false,
        "message": ""
    }

    try{
        validator.session(req.session.idx)
        validator.post({title:title, content:content})
           
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 읽기
router.get('/:postIdx', (req, res) => {
    const { postIdx } = req.params
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        
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
        result.success = true
        
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 수정
router.put("/:postIdx", (req, res) => {
    const { postIdx } = req.params
    const { title, content } = req.body
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)
        validator.post({title:title, content:content})

        //db 연동

        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 삭제
router.delete("/:postIdx", (req, res) => {
    const { postIdx } = req.params
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        validator.session(req.session.idx)

        //db 연동

        result.success = true 
        
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//게시글 전체 목록
router.get("/all", (req, res) => {
    const result = {
        "success" : false,
        "message": ""
    }
    try{
        let postList = {}

        result.data = postList
        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

module.exports = router;