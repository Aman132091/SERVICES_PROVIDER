const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({

    fullname:{
        type:String,
        required:true,
    },


    email:{
        type:String,
        // required:true,
        unique:true
    },


    gender:{
        type:String,
        // required:true,
        enum:['male','female' , 'others']
    },


    phnum:{
        type:String,  
        default: 0      
    },


    password:{
        type:String,
        // required:true
    },


    confirmpassword:{
        type:String,
    },


    otp:{
        type:String
    },


    otpPhone:{
        type:String
    },


    otpExpiration:{
        type:Date
    },


    tempEmail:{
        type:String
    },


    tempPassword:{
        type:String
    },


    tempPh:{
        type:String
    },


    profileImage:{
        type:String
    },


    googleId:{
        type:String
    }


})

const userModel = mongoose.model('User',userSchema)
module.exports = userModel