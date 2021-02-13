const express = require('express');
const commentRouter = express.Router();

const multer = require('multer');
//create upload from multer {dest: temp/, limits: {fileSize: 10}}. single'image'
const upload = multer({
    dest: 'temp/',
    limits: {
        fileSize: 10 *1024 * 1024
    },
}).single('image');


const rateLimit = require('express-rate-limit');

const tweetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5
});


const { requireAuth } = require('../controllers/authController');
const { createComment, retrieveComments, voteComment } = require('../controllers/commentController');


commentRouter.post('/:tweetId', tweetLimiter, requireAuth, upload, createComment);
commentRouter.get('/:tweetId/:offset/:exclude', retrieveComments);
commentRouter.post('/:commentId/vote', requireAuth, voteComment);

module.exports = commentRouter;