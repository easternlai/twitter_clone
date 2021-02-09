const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TweetVoteSchema = new Schema({
    tweet: {
        type: Schema.ObjectId,
        ref: 'Tweet'
    },
    votes: [ { author: {type: Schema.ObjectId, ref: 'User' }}]
});

const TweetVoteModel = mongoose.model('TweetVote', TweetVoteSchema);
module.exports = TweetVoteModel;

