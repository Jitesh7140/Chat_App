const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    phoneNumber:{type:String,   unique:true,sparse:true},
    phoneSuffix:{type:String   }, 
    username:{type:String,unique:true , sparse:true,trim:true,lowercase:true },
    email:{
        type:String,
        lowercase:true,
        trim:true,
        unique:true,
        validate:{
            validator:function(v){
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
            },
            message:"Please enter a valid email"
        }
    },
    emailOtp:{type:String},
    emailOtpExpiry:{type:String},
    profilePic:{type:String},
    about:{type:String},
    lastSeen:{type:Date, default:null},
    isOnline:{type:Boolean, default:false},
    isVerified:{type:Boolean, default:false},
    agreed:{type:Boolean, default:false},
},{timestamps:true})

const User = mongoose.model('User', userSchema)

module.exports = User