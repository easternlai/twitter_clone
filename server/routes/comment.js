const express = require('express');
const commentRouter = express.Router();

const { requireAuth } = require('../controllers/authController');
const { createComment } = require('../controllers/commentController');
const { retrieveComments } = require('../controllers/commentController');

commentRouter.post('/:tweetId', requireAuth, createComment);
commentRouter.get('/:tweetId/:offset/:exclude', retrieveComments);
module.exports = commentRouter;