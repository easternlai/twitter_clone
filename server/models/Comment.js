const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    message: String,
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    tweet: {
        type: Schema.ObjectId,
        ref: 'Tweet'
    },
});


const commentModel = mongoose.model('Comment', CommentSchema);
module.exports = commentModel;