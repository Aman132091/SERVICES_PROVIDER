const mongoose = require('mongoose')
const rShareSchema = new mongoose.Schema({
    type:String,
    title:String,
    description:String,
    pickuplocation:String,
    whereto:String,
    noofmales:Number,
    nooffemales:Number,
    fullname:String

})

const pTransportSchema = new mongoose.Schema({
    type:String,
    title:String,
    description:String,
    pickuplocation:String,
    transportto:String,
    noofitems:Number,
    totalweight:Number,
    fullname:String

})

const gFinderSchema = new mongoose.Schema({
    type:String,
    title:String,
    description:String,
    location:String,
    fullname:String

})

const aInformationSchema = new mongoose.Schema({
    type:String,
    title:String,
    description:String,
    fullname:String

})

const CategorySchema = new mongoose.Schema({
    rShare:[rShareSchema],
    pTransport:[pTransportSchema],
    gFinder:[gFinderSchema],
    aInformation:[aInformationSchema]

})



const categoryModel = mongoose.model('Category',CategorySchema)
module.exports = categoryModel