const Comment = require('../models/Comment');
const Tweet = require('../models/Tweet');
const {retrieveComments} = require('../utils/controllerUtils');

module.exports.createComment = async(req, res, next) => {
    const { tweetId } = req.params;
    const { message } = req.body;
    const user = res.locals.user;

    let tweet = undefined;

    if (!message) {
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
        
        const comment = new Comment({ message, author: user._id, tweet: tweetId});
        comment.save();
        res.send({...comment.toObject(), author: { username: user.username}});
    } catch (err) {
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
  