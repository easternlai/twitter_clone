const Tweet = require('../models/Tweet');
const TweetVote = require('../models/TweetVote');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;
const {formatCloudinaryUrl} = require ('../utils/controllerUtils');

module.exports.createTweet = async(req, res, next) => {
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

        const tweetVote = new TweetVote({
            tweet: tweet._id
        })

        await tweet.save();
        await tweetVote.save();
        //save tweet vote
        
        res.status(201).send({
            ...tweet.toObject(),
            tweetVotes: [],
            comments: [],
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
            {$match: {_id: ObjectId(tweetId)}},
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            {
                $lookup: {
                    from: 'tweetvotes',
                    localField: '_id',
                    foreignField: 'tweet',
                    as: 'tweetVotes'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    let: {tweetId: '$_id'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$tweet', '$$tweetId']
                                }
                            }
                        },
                        {
                            $sort: { date: -1}
                        },
                        {
                            $limit: 3
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'author',
                                foreignField: '_id',
                                as: 'author',
                            }
                        },
                        {
                            $unwind: '$author',
                        },
                        {
                            $unset: ['author.email', 'author.password']
                        },
                    ],
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    let: {tweetId: '$_id'},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $eq:['$tweet','$$tweetId']
                                }
                            }
                        },
                        {
                            $group: { _id: null, count: { $sum: 1}}
                        },
                        {
                            $project:{
                                _id: false
                            }
                        },
                    ],
                    as: 'commentCount'
                }
            },
            {
                $unwind: '$author'
            },
            {
                $unwind: {
                    path: '$commentCount',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $unwind: '$tweetVotes'
            },
            {
                $addFields: {
                    tweetVotes: '$tweetVotes.votes',
                    commentData: {
                        comments: '$comments',
                        commentCount: '$commentCount.count'
                    }
                }
            },
            {
                $unset: ['author.password', 'author.email', 'comments', 'commentCount']
            }
        ]);
        return res.send(tweet[0]);
    } catch (err) {
        console.log(err);
    }

}

module.exports.voteTweet = async ( req, res, next) => {
    const { tweetId } = req.params;
    const user = res.locals.user;

    try {
        const tweetVoteUpdate = await TweetVote.updateOne(
            { tweet: tweetId, 'votes.author': {$ne: user._id } },
            {
                $push: { votes: {author: user._id}},
            }
        );
        if(!tweetVoteUpdate.nModified) {
            if(!tweetVoteUpdate.ok){
                return res.status(500).send({ error: 'Could not vote on the post. '});
            }
            const tweetUnvoteUpdate = await TweetVote.updateOne(
                {tweet: tweetId},
                {$pull:{votes: { author: user._id}}}
            )
        }
        return res.send({ success: true });
    }catch(err){
        next(err);
    }

}

module.exports.retrieveTweetFeed = async (req, res, next) => {
    //get user from locals
    const user = res.locals.user;
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
            $skip: Number(offset)
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
            $lookup: {
                from: 'tweetvotes',
                localField: '_id',
                foreignField: 'tweet',
                as: 'tweetVotes'
            }
        },
        {
            $lookup: {
                from: 'comments',
                let: { tweetId: '$_id'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$tweet', '$$tweetId']
                            }
                        }
                    },
                    { $sort: { date: -1 }},
                    { $limit: 3},
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'author',
                            foreignField: '_id',
                            as: 'author',
                        }
                    },
                    {
                        $unwind: '$author',
                    },
                    {
                        $unset: ['author.email', 'author.password']
                    }

                ],
                as: 'comments',
            }
        },
        {
            $lookup: {
                from: 'comments',
                let: { tweetId: '$_id'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [ '$tweet','$$tweetId'],
                            },
                        },
                    },
                    {
                        $group: {_id: null, count: { $sum:1 } },
                    },
                    {
                        $project: {
                            _id: false
                        }
                    }
                ],
                as: 'commentCount',
            }
        },
        {
            $unwind: '$tweetVotes'
        },
        {
            $unwind: {
                path: '$commentCount',
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $unwind:'$author',
        },
        {
            $addFields: {
                tweetVotes: '$tweetVotes.votes',
                commentData: {
                    comments: '$comments',
                    commentCount: '$commentCount.count',
                },
            },
        },  
        {
            $unset: ['author.password', 'author.email', 'comments', 'commentCount']
        },  
        
    ])
    //return res.send tweets
    res.send(tweets);
}