const moongoos = require('mongoose')

const messageSchema = new moongoos.Schema({ 

    conversation:{type:moongoos.Schema.Types.ObjectId,ref:'Conversation' , require:true},
    sender:{type:moongoos.Schema.Types.ObjectId, ref:'User' , require:true},
    receiver:{type:moongoos.Schema.Types.ObjectId, ref:'User' , require:true},
    content:{type:String},
    imageOrVideoUrl:{type:String},
    contentType:{type:String, enum:['image' , 'video' , 'text']},
    reaction:[
        {
            user:{type:moongoos.Schema.Types.ObjectId, ref:'User' , require:true},
            emoji:{type:String }
         }
    ],
    messageStatus:{type:String, default:'send'}

     
},{timestamps:true})

const Message = moongoos.model('Message' , messageSchema)

module.exports = Message