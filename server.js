const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");

// config dotenv 
// require enviornmental and direct path to our config.example.env file
// config.example.env contains information regarding Facebook/Google login. JWT tokens for email account activation. And MongoDB
require('dotenv').config({
    path: './config/config.example.env'
})


const app = express()

// connect to db
connectDB();

// use body parser
app.use(bodyParser.json())

// load routes
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const mapRouter = require('./routes/map.route');


// dev login middleware
if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: process.env.CLIENT_URL
    }))
    app.use(morgan('dev'))
}

// use Routes and prefix them with /api/
app.use('/api', authRouter)
app.use('/api', userRouter)
app.use('/api', mapRouter)

app.use((req, res) => {
    res.status(404).json({
        success: false,
        msg: "page not found"
    })
})

//Server on port 5000
const PORT = process.env.PORT || 5000

//launch server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});