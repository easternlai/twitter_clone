const express = require('express');
const authRouter = require('./auth');
const tweetRouter = require('./tweet');
const commentRouter = require('./comment');
const apiRouter = express.Router();

apiRouter.use('/tweet', tweetRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/comment', commentRouter);


module.exports = apiRouter;
