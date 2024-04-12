const mongoose = require('mongoose')
const updateSchema = new mongoose.Schema({
    fullname:{
        type:String,

    },
    newEmail:{
        type:String,

    },
    newPassword:{
        type:String
    },
    newPhnum:{
        type:String
    },
    newprofileImage:{
        type:String
    },

    gender:{
        type:String,
        enum:['male' , 'female' , 'others']
    },

    otp:{
        type:String
    }
})
const updateModel = mongoose.model('update_Details',updateSchema)
module.exports = updateModel