const express = require('express');
const authRouter = express.Router();
const { loginAuthentication, register } = require('../controllers/authController');

authRouter.use('/register', register);
authRouter.use('/login', loginAuthentication);

module.exports= authRouter;