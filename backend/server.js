// All Inbuild modules
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require('cors')
const dotenv = require('dotenv') 
const http = require('http')
dotenv.config();

//other/User modules
const authRoute = require('./routes/authRoute')
const chatRoute = require('./routes/chatRoute') 
const statusRoute = require('./routes/statusRoute')
const initializeSoket = require('./services/soketService') 

const db = require('./config/db') 
PORT = process.env.PORT;
db()

//Middleware
app.use(express.json())                         // parse body data 
app.use(express.urlencoded({extended:true}))   //  parse token on every request
app.use(cookieParser())                        //  
    // app.use(cors({                                  // Allow request only selected URL
    //     origin:process.env.FRONTEND_URL,
    //     credentials:true
    // }))

// create socket server
const server  = http.createServer(app)

const io = initializeSoket(server)

app.use((req,res,next)=>{
    req.io = io
    req.socketUserMap = io.socketUserMap;
    next();
})


//routes
app.use('/api/auth' , authRoute)
app.use('/api/chats' , chatRoute)
app.use('/api/status' , statusRoute)
 

 

server.listen(PORT, () => { 
    console.log(` `); 
    console.log(`Server is running on http://localhost:${PORT}`); 
    console.log(` `); 
});