const express = require("express");
const router = express.Router();

// load controllers
const {
    registerController,
    activationController,
    signinController,
    forgotPasswordController,
    resetPasswordController,
    googleController,
    facebookController,
} = require("../controllers/auth.controller");

const {
    validSignUp,
    validLogin,
    forgotPasswordValidator,
    resetPasswordValidator,
    
} = require('../helpers/valid');

// signup, login with email, email activation
router.post('/register', validSignUp, registerController);
router.post('/login', validLogin, signinController);
router.post('/activation', activationController);
router.post('/location', (request, response) => {
    console.log('recieved request')
    console.log(request.body);
    const data = request.body;
    response.json({
        status: "success",
        latitude: data.lat,
        longitude: data.lon
    }); 
});

// forgot password reset
router.put('/forgotpassword',forgotPasswordValidator, forgotPasswordController);
router.put('/resetpassword', resetPasswordController, resetPasswordValidator);

// Google and Facebook Login

router.post('/googlelogin', googleController);
router.post('/facebooklogin', facebookController);

module.exports = router