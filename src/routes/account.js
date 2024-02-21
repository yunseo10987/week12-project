const express  = require("express") 
const router = express.Router();



//회원 가입
router.post("/", (req, res) => {
    try{
        const { id, pw, name, birth, phoneNumber, email, nickname, gender} = req.body
        const result = {
            "success" : false
        }
        const regId =  /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/
        const regPw = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
        const regNum = /^\d{3}-\d{3,4}-\d{4}$/
        const regEmail = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/
        const regBirth = /^\d{4}-\d{2}-\d{2}$/


        if(!regId.test(id)){
            throw new Error("아이디를 다시 확인해주세요")
        }
        if(!regPw.test(pw)){
            throw new Error("비밀번호를 다시 확인해주세요")
        }
        if(name.legnth > 12 || name.legnth < 1){
            throw new Error("이름을 다시 확인해주세요")
        }
        if(!regBirth.test(birth)){
            throw new Error("생년월일을 다시 확인해주세요")
        }
        if(!regNum.test(phoneNumber)){
            throw new Error("전화번호를 다시 확인해주세요")
        }
        if(!regEmail.test(email)){
            throw new Error("이메일을 다시 확인해주세요")
        }
        if(nickname.legnth > 12 || nickname.legnth < 1){
            throw new Error("닉네임을 다시 확인해주세요")
        }
        if(gender != "Male" && gender != "Female"){
            throw new Error("성별을 다시 확인해주세요")
        }
        

        //db 연결
        if(id === "stageus1234" && pw === "qwer1234!"){
            result.success = true
        }
        res.send({result})

    }catch(e){
        res.send(e.message)
    }
})

//회원 탈퇴
router.delete("/:account", (req, res) => {
    try{
        const { id } = req.params.account
        const result = {
            "success" : false
        }
        const regId =  /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/

        if(!regId.test(id)){
            throw new Error("아이디를 다시 확인해주세요")
        }
        result.success = true
        res.send({id})

    }catch(e){
        res.send(e.message)
    } 
})

//아이디 찾기

//비밀번호 찾기

//내 정보 보기

//내 정보 수정
router.put("/:account-id", (req, res) => {
    try{

    }catch(e){
        res.send(e.message)
    }
})

module.exports = router;