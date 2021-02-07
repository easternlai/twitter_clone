const express = require("express");
const tweetRouter = express.Router();
//import multer
const multer = require('multer');
//create upload from multer {dest: temp/, limits: {fileSize: 10}}. single'image'
const upload = multer({
    dest: 'temp/',
    limits: {
        fileSize: 10 *1024 * 1024
    },
}).single('image');


const rateLimit = require('express-rate-limit');

const { requireAuth } = require('../controllers/authController');
const {createTweet, retrieveTweetFeed, retrieveTweet} = require('../controllers/tweetController');

//tweetLimter rateLimit {windowMs: 15*60*1000, max: 5}

const tweetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5
});

tweetRouter.post('/', tweetLimiter, requireAuth, upload, createTweet);

tweetRouter.get('/feed/:offset', requireAuth, retrieveTweetFeed);
tweetRouter.get('/:tweetId', retrieveTweet)

module.exports = tweetRouter; 
