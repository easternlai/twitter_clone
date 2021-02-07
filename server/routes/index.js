const express = require('express');
const authRouter = require('./auth');
const tweetRouter = require('./tweet');

const apiRouter = express.Router();

apiRouter.use('/tweet', tweetRouter);
apiRouter.use('/auth', authRouter);


module.exports = apiRouter;
