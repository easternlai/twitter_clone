const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TweetSchema = new Schema({

    image: String,
    thumbnail: String,
    content: String,
    hashtags: {
        type: String,
        lowercase:true
    },
    date: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User',
    }
});

/****  code to delete Post Vote and Comment when this is deleted */

const tweetModel = mongoose.model('Tweet', TweetSchema);

module.exports = tweetModel;