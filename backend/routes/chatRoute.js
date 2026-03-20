const express = require('express')
const router = express.Router();
const chatcontroller = require('../controller/chatController'); 
const authMiddleware = require('../middleware/authMiddleware');
const { multerMiddleware } = require('../config/imageCloud');

// console.log('chat controller' , multerMiddleware    )


//protected routes
router.post('/sendMessage' ,multerMiddleware.single('file'), authMiddleware,chatcontroller.sendMessage) 
router.get('/getConversation' , authMiddleware,chatcontroller.getConversation) 
router.get('/getConversation/:conversationID/messages' , authMiddleware,chatcontroller.getMessages) 

router.put('/message/read' ,  authMiddleware,chatcontroller.markAsRead)

router.delete('/message/:messageID' , authMiddleware , chatcontroller.deleteMessage)

module.exports = router;