const userModel = require('../Models/userModel')
const jwt = require('jsonwebtoken')
exports.checkAuth = async(req,res,next)=>{
    const {authorization} = req.headers
    if(authorization && authorization.startsWith('Bearer')){
        try {
            token = authorization.split(' ')[1]
            const{userID} = jwt.verify(token,process.env.SECRET_KEY)
            req.user = userID
            next()
        } catch (error) {
            res.send({status:"failed",message:error.message})
            
        }
    }else{
        res.send({status:'failed',message:"authorization not matched....."})
    }
}