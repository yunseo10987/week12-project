const express  = require("express") 
const router = express.Router();
const validator = require('../utils/validator')

//댓글 쓰기
router.post("/:postIdx", (req, res) => {
    const { postIdx } = req.params
    const { content } = req.body
    const result = {
        "success": false,
        "message": ""
    }
    try{
        //validator.session(req.session.idx)
        validator.comment(content)
        //db 연동

        result.success = true

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//댓글 읽기
router.get("/:postIdx", (req, res) => {
    const { postIdx } = req.params
    const result = {
        "success": false,
        "message": "",
        "data": ""
    }
    try{
        
        let commentList = {}
        commentList = {
            "writer": "댓글 작성자",
            "content": "내용"
        }

        result.success = true
        result.data = commentList

    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//댓글 수정
router.put("/:commentIdx", (req, res) => {
    const { commentIdx } = req.params
    const { content } = req.body
    const result = {
        "success": false,
        "message": ""
    }
    try{
        
        validator.session(req.session.idx)
        validator.comment(content)

        //db 연동

        result.success = true
       
    }catch(e){
        result.message = e.message
    }finally{
        res.send(result)
    }
})

//댓글 삭제
router.delete("/:commentIdx", (req, res) => {
    const { commentIdx } = req.params
    const result = {
        "success": false,
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

module.exports = router;
