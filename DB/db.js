const mongoose = require('mongoose')

const connectDB = async(DATABASE_URL)=>{
    try {
        const DBOPTIONS = {
            dbName:'USER_DATA'
        }
        await mongoose.connect(DATABASE_URL,DBOPTIONS)
        console.log('successfully connected')
    } catch (error) {
        console.log(error);
        
    }
}
module.exports = connectDB