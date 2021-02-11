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
    validSign,
    ValidLog,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../helpers/valid');

router.post('/register', validSign, registerController);
router.post('/login', ValidLog, signinController);
router.post('/activation', activationController);

// forgot password reset
router.put('/forgotpassword',forgotPasswordValidator, forgotPasswordController);
router.put('/resetpassword', resetPasswordController, resetPasswordValidator);

// Google and Facebook Login

router.post('/googlelogin', googleController);
router.post('/facebooklogin', facebookController);

module.exports = router