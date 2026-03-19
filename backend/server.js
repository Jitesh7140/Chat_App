// All Inbuild modules
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require('cors')
const dotenv = require('dotenv') 
dotenv.config();
const mongoose = require('mongoose')

//other/User modules
const authRoute = require('./routes/authRoute')


const db = require('./config/db') 
PORT = process.env.PORT;
db()

//Middleware
app.use(express.json())                         // parse body data 
app.use(express.urlencoded({extended:true}))   //  parse token on every request
app.use(cookieParser())                        //  
// app.use(cors({                                  // Allow request only selected URL
//     origin:"http://localhost:5173",
//     credentials:true
// }))


//routes
app.use('/api/auth' , authRoute)
 

 

app.listen(PORT, () => { 
    console.log(` `); 
    console.log(`Server is running on http://localhost:${PORT}`); 
    console.log(` `); 
});