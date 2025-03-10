const express=require('express');
const bodyParser=require('body-parser');
const app=express();
const dotenv=require('dotenv');
dotenv.config();


const connectDB = require('./config/mongooseConfig');

connectDB();
const cookieParser=require("cookie-parser");
app.use(cookieParser())
app.use(express.json());
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));


const front = require('./routes/landingRoutes');
const instructor = require('./routes/instructorRoutes');
const student = require('./routes/studentRoutes');



app.use('/',front);
app.use('/instructor',instructor);
app.use('/student',student);

app.listen(3000,()=>{
    console.log("server is connected");
    
})