const mongoose = require('mongoose')

const statusSchema = new mongoose.Schema({
    participants:{
        type:Array,
        required:true,
        default:[]
    },
    messages:{
        type:Array,
        default:[]
    }
},{timestamps:true})

const Status = mongoose.model('Status', statusSchema)

module.exports = Status