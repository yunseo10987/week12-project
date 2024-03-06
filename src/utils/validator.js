const express  = require("express") 
const client = require("../../database/connect/postgresql")

module.exports = {
    account : function(option){
        const regId =  /^(?=.*\d)(?=.*[a-z])[0-9a-z]{8,12}$/
        const regPw = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/
        const regNum = /^\d{3}-\d{3,4}-\d{4}$/
        const regEmail = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/
        const regBirth = /^\d{4}-\d{2}-\d{2}$/
        
        if(option.id){
            if(!regId.test(option.id)){
                throw new Error("아이디를 다시 확인해주세요")
            }
        }
    
       
        if(option.pw){
            if(!regPw.test(option.pw)){
                throw new Error("비밀번호를 다시 확인해주세요")
            }
        }
    
        
        if(option.name){
            if(option.name.legnth > 12 || option.name.legnth < 1){
                throw new Error("이름을 다시 확인해주세요")
            }
        }
    
        
        if(option.birth){
            if(!regBirth.test(option.birth)){
                throw new Error("생년월일을 다시 확인해주세요")
            }
        }
    
        
        if(option.phoneNumber){
            if(!regNum.test(option.phoneNumber)){
                throw new Error("전화번호를 다시 확인해주세요")
            }
        }
    
        if(option.email){
            if(!regEmail.test(option.email) || option.email.legnth > 28){
                throw new Error("이메일을 다시 확인해주세요")
            }
        }
        
        if(option.nickname){
            if(option.nickname.legnth > 12 || option.nickname.legnth < 1){
                throw new Error("닉네임을 다시 확인해주세요")
            } 
        }
        
        if(option.gender){
            if(option.gender != "male" && option.gender != "female"){
                throw new Error("성별을 다시 확인해주세요")
            }
        }
    
    },

    duplicatedId : async function(id){
        const sql = 'SELECT idx FROM backend.account WHERE id =$1'
        const account = await client.query(sql, [id])
        console.log(account.rows)
        if(account.rows){
            throw new Error("이미 있는 아이디입니다.")
        }
    },

    session : function (sessionIdx){
        if(!sessionIdx){
            throw new Error("로그인을 해주세요.")
        }
    },
    
    post :  function (option){
        if(option.title.length < 1 || option.title.length > 30){
            throw new Error("제목은 30자 이내로 작성하세요")
        }
        if(option.content.length < 1 || option.content.length > 1500){
            throw new Error("내용은 1500자 이내로 작성하세요")
        }
    },

    comment : function (content){
        if(content.length < 1 || content.length > 500){
            throw new Error("내용은 500자 이내로 작성하세요")
        }
    }
}