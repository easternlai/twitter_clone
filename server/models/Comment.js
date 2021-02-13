const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    content: String,
    image: String,
    thumbnail: String,
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    tweet: {
        type: Schema.ObjectId,
        ref: 'Tweet'
    },

});

CommentSchema.pre('save', async function(next){

    console.log(this._id);
    if (this.isNew) {
        try {
            await mongoose.model('CommentVote').create({comment: this._id});
            next();    
        } catch (err) {
            next(err);
        }
    }
  });
  

const commentModel = mongoose.model('Comment', CommentSchema);
module.exports = commentModel;