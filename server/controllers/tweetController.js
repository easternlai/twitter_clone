const Tweet = require('../models/Tweet');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;
const {formatCloudinaryUrl} = require ('../utils/controllerUtils');

module.exports.createTweet = async(req, res, next) => {
    console.log(req.body.content)
    const user = res.locals.user
    const { content } = req.body;
    let tweet = undefined

    //define hashtag as empty array
    //pull hashtages with linkify

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    try {

        if(req.file){
            const cloudResponse = await cloudinary.uploader.upload(req.file.path);
            const thumbnailUrl = formatCloudinaryUrl(
                cloudResponse.secure_url,
                {
                    width: 400,
                    height: 400,
                },
                true
            );

            fs.unlinkSync(req.file.path);
            tweet = new Tweet({
                content,
                thumbnail: thumbnailUrl,
                image: cloudResponse.secure_url,
                author: user._id
            });
        }else{
            tweet = new Tweet({
                content,
                author: user._id,
            })
        }

        // create tweet vote from Teet Vote Model
        //save tweet

        await tweet.save();

        //save tweet vote
        
        res.status(201).send({
            ...tweet.toObject(),
            author: {username: user.username}
        });
    } catch (err) {
        next(err);
    }


    //Code to update follower feed
    
}

module.exports.retrieveTweet = async(req, res, next) => {
    const { tweetId } = req.params;
    try {
        const tweet = await Tweet.aggregate([
            {$match: {_id: tweetId}}
        ]);

    } catch (err) {
        console.log(err);
    }

}

module.exports.retrieveTweetFeed = async (req, res, next) => {
    //get user from locals
    const user = res.locals.user
    //get params from offset
    const { offset } = req.params;

    // get tweets aggregate
    const tweets = await Tweet.aggregate([
        {
            $match: {}
        },
        {
            $sort: {date: -1}
        },
        {
            $lookup: {
                from:'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
            }
        },
        {
            $unwind:'$author',
        },
        {
            $unset: ['author.password', 'author.email']
        },  
        
    ])
    //return res.send tweets
    res.send(tweets);
}