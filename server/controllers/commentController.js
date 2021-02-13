const Comment = require('../models/Comment');
const CommentVote = require('../models/CommentVote');
const Tweet = require('../models/Tweet');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;
const {formatCloudinaryUrl} = require ('../utils/controllerUtils');
const {retrieveComments} = require('../utils/controllerUtils');

module.exports.createComment = async(req, res, next) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const user = res.locals.user;
    let comment = undefined;

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    if (!content) {
        return res.status(404).send({error: "Please provide a message with your comment."})
    }
    if (!tweetId){
        return res.status(404).send({error: 'Please provide the id of the tweet you want to comment on.'})
    }
    

    try {
        tweet = await Tweet.findById(tweetId);
        if(!tweet) {
            return res.status(404).send({ error: " Could not find a tweet with that tweet id"});
        }

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
            comment = new Comment({ content, author: user._id, tweet: tweetId, image: cloudResponse.secure_url, thumbnail: thumbnailUrl});
        }else{
            comment = new Comment({  content, author: user._id, tweet: tweetId});
        }
        await comment.save();
        res.send({...comment.toObject(), author: { username: user.username}});
    } catch (err) {
        console.log('catch error')
        next(err);
    }
}

module.exports.retrieveComments = async (req, res, next) => {
    const { tweetId, offset, exclude } = req.params;
    try {
      console.log(req.params)
      const comments = await retrieveComments(tweetId, offset, exclude);
      return res.send(comments);
    } catch (err) {
      next(err);
    }
  };

  module.exports.voteComment = async (req, res, next) => {
      const {commentId } = req.params;
      const user = res.locals.user;
      try {

        const commentLikeUpdate = await CommentVote.updateOne(
            {
                comment: commentId,
                'votes.author': { $ne: user._id },
              },
              { $push: { votes: { author: user._id } } }
            );
        if(!commentLikeUpdate.nModified){
            if(!commentLikeUpdate.ok){
                return res.status(500).send({ error: 'Could not vote on the comment 1.' });
            }
            const commentDislikeUpdate = await CommentVote.updateOne(
                {comment: commentId},
                {$pull: {votes: {author: user._id}}}
            );
    
            if(!commentDislikeUpdate.nModified){
                return res.status(500).send({ error: 'Could not vote on the comment 2.' });
            }
        }

        return res.send({ success: true});
      } catch (err) {
       console.log(err);   
      }
  }
  